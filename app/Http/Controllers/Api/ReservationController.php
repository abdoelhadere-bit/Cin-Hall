<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Seat;
use App\Models\Seance;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'seance_id' => 'required|exists:seances,id',
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'exists:seats,id',
        ]);

        // Check if ANY of the requested seats are already reserved for this seance
        $alreadyReserved = Reservation::where('seance_id', $validated['seance_id'])
            ->whereHas('seats', function ($query) use ($validated) {
                $query->whereIn('seat_id', $validated['seat_ids']);
            })->whereIn('status', ['pending', 'paid'])->exists();

        if ($alreadyReserved) {
            return response()->json([
                'error' => 'One or more selected seats are already reserved.'
            ], 422);
        }

        // Fetch the Seance to get the base_price
        $seance = Seance::findOrFail($validated['seance_id']);
        $seats = Seat::whereIn('id', $validated['seat_ids'])->get();

        $totalPrice = 0;
        
        foreach ($seats as $seat) {
            // Ensure seat belongs to the correct salle
            if ($seat->salle_id !== $seance->salle_id) {
                return response()->json([
                    'error' => 'One or more seats do not belong to the room assigned to this seance.'
                ], 422);
            }

            // Calculate price based on seat type
            if ($seat->type === 'vip') {
                $totalPrice += $seance->base_price + 30; // 30 DHS premium for VIP
            } elseif ($seat->type === 'couple') {
                $totalPrice += ($seance->base_price * 2); // Couple seat counts as 2 seats
            } else {
                $totalPrice += $seance->base_price; // Standard
            }
        }

        // Create the Reservation 
        $reservation = Reservation::create([
            'user_id' => $validated['user_id'],
            'seance_id' => $validated['seance_id'],
            'total_price' => $totalPrice,
            'status' => 'pending',
            'expires_at' => now()->addMinutes(15),
        ]);

        // Link the Seats to the Reservation in the pivot table
        $reservation->seats()->attach($validated['seat_ids']);

        return response()->json([
            'message' => 'Reservation created successfully! Please pay within 15 minutes.',
            'reservation' => $reservation->load('seats')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

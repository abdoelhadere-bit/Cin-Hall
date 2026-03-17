<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Seat;

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
            'showing_id' => 'nullable|integer', 
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'exists:seats,id',
        ]);

        // Check if ANY of the requested seats are already reserved for this showing
        $alreadyReserved = Reservation::whereHas('seats', function ($query) use ($validated) {
            $query->whereIn('seat_id', $validated['seat_ids']);
        })->whereIn('status', ['pending', 'paid'])->exists();

        if ($alreadyReserved) {
            return response()->json([
                'error' => 'One or more selected seats are already reserved.'
            ], 422);
        }

        // Calculate Price 
        $ticketPrice = 10.00;
        $totalPrice = count($validated['seat_ids']) * $ticketPrice;

        // Create the Reservation 
        $reservation = Reservation::create([
            'user_id' => $validated['user_id'],
            'showing_id' => $validated['showing_id'] ?? null,
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

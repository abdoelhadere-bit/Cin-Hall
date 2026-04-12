<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Seat;
use App\Models\Seance;
use App\Services\TicketService;

class ReservationController extends Controller
{
   
    public function index()
    {
        $reservations = Reservation::with(['seance.film', 'seance.salle', 'seats', 'ticket'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return response()->json($reservations);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'seance_id' => 'required|exists:seances,id',
            'seat_ids'  => 'required|array|min:1',
            'seat_ids.*' => 'exists:seats,id',
        ]);

        $seance = Seance::findOrFail($validated['seance_id']);
        $seats  = Seat::whereIn('id', $validated['seat_ids'])->get();

        $hasCoupleSeat = $seats->contains(fn($s) => $s->type === 'couple');
        if ($hasCoupleSeat) {
            if ($seance->session_type !== 'vip') {
                return response()->json([
                    'error' => 'Couple seats are only available in VIP seances.'
                ], 422);
            }
            if (count($validated['seat_ids']) !== 2) {
                return response()->json([
                    'error' => 'A couple seat reservation must book exactly 2 seats.'
                ], 422);
            }
        }

        foreach ($seats as $seat) {
            if ($seat->salle_id !== $seance->salle_id) {
                return response()->json([
                    'error' => 'One or more seats do not belong to the room assigned to this seance.'
                ], 422);
            }
        }

        $alreadyReserved = Reservation::where('seance_id', $validated['seance_id'])
            ->whereHas('seats', fn($q) => $q->whereIn('seats.id', $validated['seat_ids']))
            ->whereIn('status', ['pending', 'paid'])
            ->exists();

        if ($alreadyReserved) {
            return response()->json([
                'error' => 'One or more selected seats are already reserved.'
            ], 422);
        }

        $totalPrice = 0;
        foreach ($seats as $seat) {
            if ($seat->type === 'vip') {
                $totalPrice += $seance->base_price + 30;
            } elseif ($seat->type === 'couple') {
                $totalPrice += $seance->base_price * 2;
            } else {
                $totalPrice += $seance->base_price;
            }
        }

        $reservation = Reservation::create([
            'user_id'     => auth()->id(),
            'seance_id'   => $validated['seance_id'],
            'total_price' => $totalPrice,
            'status'      => 'pending',
            'expires_at'  => now()->addMinutes(15),
        ]);

        $reservation->seats()->attach($validated['seat_ids']);

        return response()->json([
            'message'     => 'Reservation created successfully! Please pay within 15 minutes.',
            'reservation' => $reservation->load(['seats', 'seance.film'])
        ], 201);
    }

    public function show(string $id)
    {
        $reservation = Reservation::with(['seance.film', 'seance.salle', 'seats', 'ticket'])
            ->findOrFail($id);

        if ($reservation->user_id !== auth()->id() && !auth()->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($reservation);
    }

    public function update(Request $request, string $id)
    {
        $reservation = Reservation::findOrFail($id);

        if ($reservation->user_id !== auth()->id() && !auth()->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($reservation->status !== 'pending') {
            return response()->json([
                'error' => 'Only pending reservations can be cancelled.'
            ], 422);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json([
            'message'     => 'Reservation cancelled successfully.',
            'reservation' => $reservation
        ]);
    }

        public function destroy(string $id)
    {
        $reservation = Reservation::findOrFail($id);

        if ($reservation->user_id !== auth()->id() && !auth()->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!auth()->user()->is_admin && $reservation->status !== 'pending') {
            return response()->json([
                'error' => 'You can only delete pending reservations.'
            ], 422);
        }

        $reservation->seats()->detach();
        $reservation->delete();

        return response()->json(['message' => 'Reservation deleted successfully.']);
    }

    /**
     * DEMO ONLY — simulate a successful payment without Stripe/PayPal.
     */
    public function simulatePayment(string $id, TicketService $ticketService)
    {
        $reservation = Reservation::with(['user', 'seats', 'seance.film', 'ticket'])
            ->findOrFail($id);

        if ($reservation->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($reservation->status === 'paid') {
            return response()->json(['message' => 'Already paid', 'reservation' => $reservation]);
        }

        if ($reservation->status !== 'pending') {
            return response()->json(['error' => 'Only pending reservations can be paid.'], 422);
        }

        $reservation->update(['status' => 'paid']);
        $reservation->refresh();

        // Generate ticket (QR code + PDF)
        $ticket = $ticketService->generate($reservation);

        return response()->json([
            'message'     => 'Payment simulated successfully.',
            'reservation' => $reservation->load(['seats', 'seance.film', 'ticket']),
        ]);
    }
}

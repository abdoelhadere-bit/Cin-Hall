<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Reservation;
use App\Models\Ticket;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{

    public function show($reservationId)
    {
        $reservation = Reservation::with('ticket', 'seats')->findOrFail($reservationId);
        if ($reservation->user_id !== auth()->id() && !auth()->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$reservation->ticket) {
            return response()->json(['message' => 'Ticket not generated yet'], 404);
        }

        return response()->json([
            'reservation_id' => $reservation->id,
            'status'         => $reservation->status,
            'ticket'         => [
                'id'          => $reservation->ticket->id,
                'qr_code_url' => asset('storage/' . $reservation->ticket->qr_code),
                'pdf_url'     => asset('storage/' . $reservation->ticket->pdf_url),
            ]
        ]);
    }

    public function downloadPdf($ticketId)
    {
        $ticket = Ticket::with('reservation')->findOrFail($ticketId);

        // Ownership check
        if ($ticket->reservation->user_id !== auth()->id() && !auth()->user()->is_admin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!Storage::disk('public')->exists($ticket->pdf_url)) {
            return response()->json(['message' => 'PDF file not found'], 404);
        }

        return Storage::disk('public')->download($ticket->pdf_url);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Reservation;
use App\Models\Ticket;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    /**
     * Get ticket details for a reservation.
     */
    public function show($reservationId)
    {
        $reservation = Reservation::with('ticket', 'seats')->findOrFail($reservationId);
        
        if (!$reservation->ticket) {
            return response()->json(['message' => 'Ticket not generated yet'], 404);
        }

        return response()->json([
            'reservation_id' => $reservation->id,
            'status' => $reservation->status,
            'ticket' => [
                'id' => $reservation->ticket->id,
                'qr_code_url' => asset('storage/' . $reservation->ticket->qr_code),
                'pdf_url' => asset('storage/' . $reservation->ticket->pdf_url),
            ]
        ]);
    }

    /**
     * Download the ticket PDF.
     */
    public function downloadPdf($ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);
        
        if (!Storage::disk('public')->exists($ticket->pdf_url)) {
            return response()->json(['message' => 'PDF file not found'], 404);
        }

        return Storage::disk('public')->download($ticket->pdf_url);
    }
}

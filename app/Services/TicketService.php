<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Ticket;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class TicketService
{
    /**
     * Generate a ticket for the given reservation.
     *
     * @param Reservation $reservation
     * @return Ticket
     */
    public function generate(Reservation $reservation)
    {
        // Check if ticket already exists
        if ($reservation->ticket) {
            return $reservation->ticket;
        }

        $qrCodeData = route('tickets.verify', ['id' => $reservation->id]);
        $qrCode = QrCode::create($qrCodeData);
        $writer = new SvgWriter();
        $result = $writer->write($qrCode);

        $qrCodeFileName = 'qrcodes/ticket_' . $reservation->id . '.svg';
        Storage::disk('public')->put($qrCodeFileName, $result->getString());

        $ticket = Ticket::create([
            'reservation_id' => $reservation->id,
            'qr_code' => $qrCodeFileName,
        ]);

        // Generate PDF
        $this->generatePdf($ticket);

        return $ticket;
    }

    /**
     * Generate a PDF for the given ticket.
     *
     * @param Ticket $ticket
     * @return string
     */
    public function generatePdf(Ticket $ticket)
    {
        $reservation = $ticket->reservation;
        
        // DomPDF might struggle with embedded SVG without certain settings
        // but we'll try it with plain view first
        $pdf = Pdf::loadView('tickets.pdf', compact('ticket', 'reservation'));
        
        $pdfFileName = 'tickets/ticket_' . $reservation->id . '.pdf';
        Storage::disk('public')->put($pdfFileName, $pdf->output());

        $ticket->update([
            'pdf_url' => $pdfFileName,
        ]);

        return $pdfFileName;
    }
}

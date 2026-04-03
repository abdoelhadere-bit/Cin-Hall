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

        // Generate QR Code data
        $qrCodeData = route('tickets.verify', ['id' => $reservation->id]);
        $qrCode = new QrCode($qrCodeData);
        $writer = new SvgWriter();
        $result = $writer->write($qrCode);

        // Ensure directory exists
        if (!Storage::disk('public')->exists('qrcodes')) {
            Storage::disk('public')->makeDirectory('qrcodes');
        }

        $qrCodeFileName = 'qrcodes/ticket_' . $reservation->id . '.svg';
        Storage::disk('public')->put($qrCodeFileName, $result->getString());

        $ticket = Ticket::create([
            'reservation_id' => $reservation->id,
            'qr_code' => $qrCodeFileName,
        ]);

        // Set the reservation relation to avoid reloading
        $ticket->setRelation('reservation', $reservation);

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
        
        if (!$reservation->relationLoaded('user')) {
             $reservation->load('user');
        }

        $qrCodeContent = Storage::disk('public')->get($ticket->qr_code);
        
        // Base64 encode SVG for embedding in PDF
        $qrCodeBase64 = base64_encode($qrCodeContent);
        $qrCodeDataUri = 'data:image/svg+xml;base64,' . $qrCodeBase64;

        $html = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; color: #333; }
                .ticket-container { border: 2px solid #333; padding: 20px; margin: 20px; border-radius: 10px; }
                .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #e53e3e; }
                .detail { margin: 10px 0; font-size: 16px; }
                .qr-code { margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class='ticket-container'>
                <div class='header'>Cinema Ticket</div>
                <div class='detail'><strong>Reservation ID:</strong> #{$reservation->id}</div>
                <div class='detail'><strong>User:</strong> {$reservation->user->name}</div>
                <div class='detail'><strong>Amount:</strong> \${$reservation->total_price}</div>
                <div class='detail'><strong>Status:</strong> Paid</div>
                <div class='qr-code'>
                    <img src='{$qrCodeDataUri}' width='200' height='200'>
                </div>
            </div>
        </body>
        </html>
        ";

        $pdf = Pdf::loadHTML($html);
        
        // Ensure directory exists
        if (!Storage::disk('public')->exists('tickets')) {
            Storage::disk('public')->makeDirectory('tickets');
        }

        $pdfFileName = 'tickets/ticket_' . $reservation->id . '.pdf';
        Storage::disk('public')->put($pdfFileName, $pdf->output());

        $ticket->update([
            'pdf_url' => $pdfFileName,
        ]);

        return $pdfFileName;
    }
}

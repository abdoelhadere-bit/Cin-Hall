<?php

use App\Models\Reservation;
use App\Models\Ticket;

    class TicketService{
        public function generate(Reservation $reservation){
            if($reservation->tickets){
                return $reservation->tickets;
            }
            $qrData = json_encode([
                'reservation_id' => $reservation->id,
                'user_id' => $reservation->user_id,
                'showing_id' => $reservation->showing_id
            ]);

            $qrPath = 'qrcodes/ticket_' . $reservation->id . '.png';

            QrCode::format('png')
                ->size(200)
                ->generate($qrData, public_path($qrPath));
            
            $pdf = Pdf::loadView('tickets.pdf',[
                'resrevation' => $reservation,
                'qrPath' => public_path($qrPath)
            ]);

            $pdfPath = 'tickets/ticket_' . $reservation->id . '.pdf';
            $pdf->save(public_path($pdfPath));
            
            return Ticket::create([
                'reservaton_id' => $reservation->id,
                'qr_code' => $qrPath,
                'pdf_path' => $pdfPath 
            ]);
        
        }
    }
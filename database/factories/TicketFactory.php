<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        return [
            'reservation_id' => Reservation::factory(),
            'qr_code'        => 'qrcodes/test_ticket.svg',
            'pdf_url'        => 'tickets/test_ticket.pdf',
        ];
    }
}

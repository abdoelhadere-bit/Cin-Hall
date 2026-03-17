<?php

namespace Database\Factories;

use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'showing_id' => 1,
            'total_price' => 50.00,
            'status' => 'pending',
            'expires_at' => now()->addHour(),
        ];
    }
}

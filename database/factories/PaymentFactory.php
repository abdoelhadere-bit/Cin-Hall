<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'reservation_id' => Reservation::factory(),
            'payment_method' => $this->faker->randomElement(['stripe', 'paypal']),
            'transaction_id' => 'ch_' . $this->faker->uuid,
            'amount'         => 100.00,
            'status'         => 'success',
        ];
    }
}

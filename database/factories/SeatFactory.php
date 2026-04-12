<?php

namespace Database\Factories;

use App\Models\Seat;
use App\Models\Salle;
use Illuminate\Database\Eloquent\Factories\Factory;

class SeatFactory extends Factory
{
    protected $model = Seat::class;

    public function definition()
    {
        return [
            'salle_id'    => Salle::factory(),
            'row_letter'  => $this->faker->lexify('?'),
            'seat_number' => $this->faker->numberBetween(1, 20),
            'type'        => 'standard',
        ];
    }
}

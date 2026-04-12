<?php

namespace Database\Factories;

use App\Models\Seance;
use App\Models\Film;
use App\Models\Salle;
use Illuminate\Database\Eloquent\Factories\Factory;

class SeanceFactory extends Factory
{
    protected $model = Seance::class;

    public function definition(): array
    {
        $startTime = $this->faker->dateTimeBetween('+1 hour', '+1 month');
        return [
            'film_id'      => Film::factory(),
            'salle_id'     => Salle::factory(),
            'start_time'   => $startTime,
            'end_time'     => (clone $startTime)->modify('+2 hours'),
            'language'     => 'French',
            'session_type' => 'normal',
            'base_price'   => 50.00,
        ];
    }
}

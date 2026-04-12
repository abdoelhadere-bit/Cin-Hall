<?php

namespace Database\Factories;

use App\Models\Salle;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalleFactory extends Factory
{
    protected $model = Salle::class;

    public function definition()
    {
        return [
            'name'          => 'Hall ' . $this->faker->unique()->numberBetween(1, 100),
            'total_rows'    => 10,
            'seats_per_row' => 12,
        ];
    }
}

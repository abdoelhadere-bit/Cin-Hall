<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoomFactory extends Factory
{
    protected $model = Room::class;

    public function definition()
    {
        return [
            'name' => 'Theater ' . $this->faker->unique()->numberBetween(1, 10),
            'capacity' => 100,
        ];
    }
}

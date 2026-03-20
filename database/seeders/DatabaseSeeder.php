<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Film;
use App\Models\Salle;
use App\Models\Seat;
use App\Models\Seance;
use App\Models\Reservation;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a Test User
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('password'),
        ]);

        // 2. Create a Salle (Room)
        $salle = Salle::create([
            'name' => 'Main Hall',
            'total_rows' => 5,
            'seats_per_row' => 10,
        ]);

        // 3. Create Seats for the Salle
        $rows = range('A', 'E');
        for ($i = 0; $i < 5; $i++) {
            for ($j = 1; $j <= 10; $j++) {
                Seat::create([
                    'salle_id' => $salle->id,
                    'row_letter' => $rows[$i],
                    'seat_number' => $j,
                    'type' => ($i >= 4) ? 'vip' : 'standard',
                ]);
            }
        }

        // 4. Create a Film
        $film = Film::create([
            'title' => 'Inception',
            'description' => 'A dream within a dream',
            'duration' => 148,
        ]);

        // 5. Create a Showing (Seance)
        $seance = Seance::create([
            'film_id' => $film->id,
            'salle_id' => $salle->id,
            'start_time' => now()->addHours(2),
            'end_time' => now()->addHours(5),
            'language' => 'English',
            'session_type' => 'normal',
            'base_price' => 10.00,
        ]);

        // 6. Create a Reservation
        $reservation = Reservation::create([
            'user_id' => $user->id,
            'seance_id' => $seance->id,
            'total_price' => 20.00,
            'status' => 'pending',
        ]);

        // 7. Attach Seats to the Reservation (if pivot table exists)
        // Check if reservation_seat exists or seats have reservation_id
        // In the current schema, we have `reservation_seat` table
        $seatsToReserve = Seat::where('salle_id', $salle->id)->take(2)->pluck('id');
        $reservation->seats()->attach($seatsToReserve);
    }
}

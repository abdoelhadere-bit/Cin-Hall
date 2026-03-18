<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create a User for testing
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'test@cinehall.com'],
            ['name' => 'Test User', 'password' => bcrypt('password123')]
        );

        // 2. Create a Salle (Room)
        $salle = \App\Models\Salle::firstOrCreate(
            ['name' => 'Salle VIP Atlas'],
            ['total_rows' => 5, 'seats_per_row' => 10]
        );

        // Generate seats if the salle was just created
        if ($salle->wasRecentlyCreated) {
            $rows = range('A', 'Z');
            $seatsData = [];
            for ($i = 0; $i < $salle->total_rows; $i++) {
                $rowLetter = $rows[$i];
                for ($j = 1; $j <= $salle->seats_per_row; $j++) {
                    $seatsData[] = [
                        'salle_id' => $salle->id,
                        'row_letter' => $rowLetter,
                        'seat_number' => $j,
                        'type' => 'standard',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            \App\Models\Seat::insert($seatsData);

            // Make the last row Couple seats
            \App\Models\Seat::where('salle_id', $salle->id)
                ->where('row_letter', 'E')
                ->update(['type' => 'couple']);
                
            // Make the second to last row VIP
            \App\Models\Seat::where('salle_id', $salle->id)
                ->where('row_letter', 'D')
                ->update(['type' => 'vip']);
        }

        // 3. Create a Film
        $film = \App\Models\Film::firstOrCreate(
            ['title' => 'Dune: Part Two'],
            [
                'description' => 'Paul Atreides s\'unit à Chani et aux Fremen...',
                'duration' => 166,
                'minimum_age' => 12,
                'genre' => 'Sci-Fi'
            ]
        );

        // 4. Create a Seance (Showing)
        \App\Models\Seance::firstOrCreate(
            [
                'film_id' => $film->id,
                'salle_id' => $salle->id,
            ],
            [
                'start_time' => now()->addDays(2)->format('Y-m-d H:i:s'),
                'language' => 'VOSTFR',
                'session_type' => 'vip',
                'base_price' => 50.00
            ]
        );
    }
}

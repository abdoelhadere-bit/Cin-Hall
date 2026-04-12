<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Film;
use App\Models\Salle;
use App\Models\Seance;
use App\Models\Seat;
use App\Models\Reservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPUnit\Framework\Attributes\Test;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;
    protected $admin;
    protected $adminToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user  = User::factory()->create(['is_admin' => false]);
        $this->token = JWTAuth::fromUser($this->user);

        $this->admin      = User::factory()->create(['is_admin' => true]);
        $this->adminToken = JWTAuth::fromUser($this->admin);
    }

    #[Test]
    public function guest_cannot_create_reservation()
    {
        $response = $this->postJson('/api/reservations', [
            'seance_id' => 1,
            'seat_ids'  => [1],
        ]);

        $response->assertStatus(401);
    }

    #[Test]
    public function user_can_create_reservation_and_prices_are_correct()
    {
        $film   = Film::create(['title' => 'Inception', 'duration' => 120, 'genre' => 'Sci-Fi']);
        $salle  = Salle::create(['name' => 'Salle 1', 'total_rows' => 2, 'seats_per_row' => 2]);
        
        // Auto-generate seats (SalleController logic)
        $seat1 = Seat::create(['salle_id' => $salle->id, 'row_letter' => 'A', 'seat_number' => 1, 'type' => 'standard']);
        $seat2 = Seat::create(['salle_id' => $salle->id, 'row_letter' => 'A', 'seat_number' => 2, 'type' => 'vip']);

        $seance = Seance::create([
            'film_id'      => $film->id,
            'salle_id'     => $salle->id,
            'start_time'   => now()->addDay(),
            'session_type' => 'normal',
            'base_price'   => 50,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/reservations', [
                'seance_id' => $seance->id,
                'seat_ids'  => [$seat1->id, $seat2->id],
            ]);

        $response->assertStatus(201);
        
        // Standard (50) + VIP (50 + 30) = 130
        $response->assertJsonPath('reservation.total_price', 130);
        $this->assertDatabaseHas('reservations', [
            'user_id'     => $this->user->id,
            'total_price' => 130,
        ]);
    }

    #[Test]
    public function user_cannot_view_others_reservation()
    {
        $otherUser = User::factory()->create();
        $res       = Reservation::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/reservations/{$res->id}");

        $response->assertStatus(403);
    }

    #[Test]
    public function couple_seat_requires_vip_seance_and_two_seats()
    {
        $film   = Film::create(['title' => 'Romance', 'duration' => 90, 'genre' => 'Drama']);
        $salle  = Salle::create(['name' => 'Salle 2', 'total_rows' => 1, 'seats_per_row' => 2]);
        $seat1  = Seat::create(['salle_id' => $salle->id, 'row_letter' => 'A', 'seat_number' => 1, 'type' => 'couple']);
        $seat2  = Seat::create(['salle_id' => $salle->id, 'row_letter' => 'A', 'seat_number' => 2, 'type' => 'standard']);

        $normalSeance = Seance::create([
            'film_id'      => $film->id,
            'salle_id'     => $salle->id,
            'start_time'   => now()->addDay(),
            'session_type' => 'normal',
            'base_price'   => 40,
        ]);

        // Attempt in normal seance -> fail
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/reservations', [
                'seance_id' => $normalSeance->id,
                'seat_ids'  => [$seat1->id],
            ]);
        $response->assertStatus(422);

        $vipSeance = Seance::create([
            'film_id'      => $film->id,
            'salle_id'     => $salle->id,
            'start_time'   => now()->addDay(),
            'session_type' => 'vip',
            'base_price'   => 40,
        ]);

        // Attempt with single seat in VIP -> fail
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/reservations', [
                'seance_id' => $vipSeance->id,
                'seat_ids'  => [$seat1->id],
            ]);
        $response->assertStatus(422);

        // Success with exactly 2 seats (one couple)
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/reservations', [
                'seance_id' => $vipSeance->id,
                'seat_ids'  => [$seat1->id, $seat2->id],
            ]);
        $response->assertStatus(201);
    }
}

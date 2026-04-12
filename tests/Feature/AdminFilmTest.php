<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Film;
use App\Models\Salle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPUnit\Framework\Attributes\Test;

class AdminFilmTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->token = JWTAuth::fromUser($this->admin);
    }

    #[Test]
    public function admin_can_create_film()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/films', [
                'title'       => 'Interstellar',
                'description' => 'A great space movie',
                'duration'    => 169,
                'genre'       => 'Sci-Fi'
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('films', ['title' => 'Interstellar']);
    }

    #[Test]
    public function non_admin_cannot_create_film()
    {
        $user  = User::factory()->create(['is_admin' => false]);
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/films', [
                'title' => 'Forbidden Film'
            ]);

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_create_room_and_seats_are_generated()
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/rooms', [
                'name'          => 'Grand Hall',
                'total_rows'    => 5,
                'seats_per_row' => 10
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('salles', ['name' => 'Grand Hall']);
        $this->assertDatabaseCount('seats', 50); // 5 * 10
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPUnit\Framework\Attributes\Test;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function a_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'name'     => 'John Doe',
            'email'    => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['message', 'user' => ['id', 'name', 'email']]);
        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }

    #[Test]
    public function a_user_can_login()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['access_token', 'token_type', 'expires_in', 'user']);
    }

    #[Test]
    public function a_user_can_update_their_profile()
    {
        $user  = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/profile', [
                'name' => 'Jane Updated',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Jane Updated']);
    }

    #[Test]
    public function a_user_can_delete_their_account()
    {
        $user  = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/profile');

        $response->assertStatus(200);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
}

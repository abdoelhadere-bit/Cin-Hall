<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\TicketService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Mockery;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPUnit\Framework\Attributes\Test;

class PaymentTicketTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->token = JWTAuth::fromUser($this->user);
    }

    #[Test]
    public function it_can_initiate_stripe_checkout()
    {
        $reservation = Reservation::factory()->create([
            'user_id' => $this->user->id,
            'total_price' => 100
        ]);

        $mockPaymentService = Mockery::mock(PaymentService::class);
        $mockPaymentService->shouldReceive('createStripeSession')
            ->once()
            ->andReturn((object) ['url' => 'http://stripe.com/test-session']);

        $this->app->instance(PaymentService::class, $mockPaymentService);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/reservations/{$reservation->id}/checkout", [
                'payment_method' => 'stripe'
            ]);

        $response->assertStatus(200);
        $response->assertJson(['url' => 'http://stripe.com/test-session']);
        
        $this->assertDatabaseHas('payment', [
            'reservation_id' => $reservation->id,
            'payment_method' => 'stripe',
            'status' => 'pending'
        ]);
    }

    #[Test]
    public function it_handles_stripe_webhook_and_generates_ticket()
    {
        Storage::fake('public');

        $reservation = Reservation::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'pending'
        ]);
        
        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'payment_method' => 'stripe',
            'amount' => $reservation->total_price,
            'status' => 'pending'
        ]);

        // Mock Stripe Webhook verification
        Mockery::mock('alias:\Stripe\Webhook')
            ->shouldReceive('constructEvent')
            ->andReturn((object) [
                'type' => 'checkout.session.completed',
                'data' => (object) [
                    'object' => (object) [
                        'id' => 'session_123',
                        'metadata' => (object) [
                            'payment_id' => $payment->id,
                            'reservation_id' => $reservation->id
                        ]
                    ]
                ]
            ]);

        $response = $this->postJson('/api/webhook', [], [
            'Stripe-Signature' => 'dummy-signature'
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'paid'
        ]);

        $this->assertDatabaseHas('payment', [
            'id' => $payment->id,
            'status' => 'success',
            'transaction_id' => 'session_123'
        ]);

        $this->assertDatabaseHas('tickets', [
            'reservation_id' => $reservation->id
        ]);
    }

    #[Test]
    public function it_can_view_ticket_details()
    {
        $reservation = Reservation::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'paid'
        ]);
        
        $ticket = \App\Models\Ticket::create([
            'reservation_id' => $reservation->id,
            'qr_code' => 'qrcodes/test.png',
            'pdf_url' => 'tickets/test.pdf'
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/reservations/{$reservation->id}/ticket");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'reservation_id',
            'status',
            'ticket' => ['id', 'qr_code_url', 'pdf_url']
        ]);
    }
}

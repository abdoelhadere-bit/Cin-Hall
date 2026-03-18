<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;
use App\Services\PaymentService;
use App\Services\TicketService;

class PaymentController extends Controller
{
    protected $paymentService;
    protected $ticketService;

    public function __construct(PaymentService $paymentService, TicketService $ticketService)
    {
        $this->paymentService = $paymentService;
        $this->ticketService = $ticketService;
    }

    /**
     * Entry point for payments.
     * 
     * @param Request $request
     * @param int $reservationId
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkout(Request $request, $reservationId)
    {
        $request->validate([
            'payment_method' => 'required|in:stripe,paypal',
        ]);

        $reservation = Reservation::findOrFail($reservationId);
        
        if ($reservation->status === 'paid') {
            return response()->json(['message' => 'Reservation already paid'], 400);
        }

        $payment = Payment::create([
            'reservation_id' => $reservation->id,
            'payment_method' => $request->payment_method,
            'amount' => $reservation->total_price,
            'status' => 'pending'
        ]);

        try {
            if ($request->payment_method === 'stripe') {
                $session = $this->paymentService->createStripeSession($reservation, $payment);
                return response()->json(['url' => $session->url]);
            } else {
                // PayPal
                $order = $this->paymentService->createPayPalOrder($reservation, $payment);
                return response()->json(['url' => $order->url]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Redirect here after successful payment to verify session.
     */
    public function success(Request $request)
    {
        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            return response()->json(['error' => 'No session ID provided'], 400);
        }

        try {
            $session = $this->paymentService->retrieveStripeSession($sessionId);
            
            if ($session->payment_status === 'paid') {
                $result = $this->paymentService->completePayment($session, $this->ticketService);
                
                if ($result['success'] && isset($result['reservation'])) {
                    $res = $result['reservation'];
                    $ticket = $res->ticket;
                    
                    return response()->json([
                        'message' => 'Payment successful',
                        'reservation_id' => $res->id,
                        'ticket' => $ticket ? [
                            'id' => $ticket->id,
                            'pdf_url' => asset('storage/' . $ticket->pdf_url),
                        ] : null
                    ], 200);
                }
            }

            return response()->json(['message' => 'Payment already processed or session not paid'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Webhook for payment confirmations (Stripe).
     */
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $this->paymentService->completePayment($session, $this->ticketService);
        }

        return response('Webhook handled', 200);
    }
}

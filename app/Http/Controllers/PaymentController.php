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
                $order = $this->paymentService->createPayPalOrder($reservation, $payment);
                return response()->json(['url' => $order->url]);
            }
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
            $paymentId = $session->metadata->payment_id;
            
            $payment = Payment::find($paymentId);

            if ($payment && $payment->status !== 'success') {
                $payment->update([
                    'status' => 'success',
                    'transaction_id' => $session->id,
                ]);

                $reservation = Reservation::with('user', 'seats')->find($session->metadata->reservation_id);

                if ($reservation) {
                    $reservation->update(['status' => 'paid']);
                    
                    // Generate ticket
                    $this->ticketService->generate($reservation);
                }
            }
        }

        return response('Webhook handled', 200);
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
            $result = $this->paymentService->handleSuccessRedirect($sessionId, $this->ticketService);
            
            if ($result['success']) {
                $reservation = $result['reservation'];
                return response()->json([
                    'message' => 'Payment successful',
                    'reservation_id' => $reservation->id,
                    'status' => $reservation->status,
                    'ticket' => $reservation->ticket
                ]);
            }

            return response()->json(['error' => $result['message']], 400);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

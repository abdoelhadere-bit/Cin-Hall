<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Reservation;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class PaymentService
{
    public function createStripeSession(Reservation $reservation, Payment $payment)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        return StripeSession::create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'Cinema Reservation #' . $reservation->id,
                    ],
                    'unit_amount' => (int) ($reservation->total_price * 100),
                ],
                'quantity' => 1,
            ]],
            'success_url' => url('/payment/success?session_id={CHECKOUT_SESSION_ID}'),
            'cancel_url' => url('/payment/cancel'),
            'metadata' => [
                'payment_id' => $payment->id,
                'reservation_id' => $reservation->id
            ],
        ]);
    }

    public function handleSuccessRedirect(string $sessionId, TicketService $ticketService)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $session = StripeSession::retrieve($sessionId);

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
                $ticketService->generate($reservation);
                $reservation->load('ticket');

                return [
                    'success' => true,
                    'reservation' => $reservation
                ];
            }
        }

        if ($payment && $payment->status === 'success') {
             $reservation = Reservation::with('ticket')->find($payment->reservation_id);
             return [
                'success' => true,
                'reservation' => $reservation
            ];
        }

        return [
            'success' => false,
            'message' => 'Payment already processed or not found'
        ];
    }

    /**
     * This is a mock/placeholder for PayPal integration as no SDK is installed.
     * In a real project, we would use a package like 'srmklive/laravel-paypal'.
     */
    public function createPayPalOrder(Reservation $reservation, Payment $payment)
    {
        return (object) [
            'url' => 'https://www.sandbox.paypal.com/checkoutnow?id=MOCK_ORDER_ID'
        ];
    }
}

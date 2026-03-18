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

    /**
     * This is a mock/placeholder for PayPal integration as no SDK is installed.
     * In a real project, we would use a package like 'srmklive/laravel-paypal'.
     */
    // public function createPayPalOrder(Reservation $reservation, Payment $payment)
    // {
    //     // For demonstration, let's assume we return a mock URL
    //     return (object) [
    //         'url' => 'https://www.sandbox.paypal.com/checkoutnow?id=MOCK_ORDER_ID'
    //     ];
    // }
}

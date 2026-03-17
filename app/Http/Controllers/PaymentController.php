<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use App\Models\Reservation;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        //
    }
    public function checkout($reservationId)
    {
        $reservation = Reservation::findOrFail($reservationId);
        if ($reservation->status === 'paid') {
            return response()->json([
                'message' => 'reservation already reserved',
                400
            ]);
        }

        // the total price calculations must be counted in the reservationController
        // $seatCount = $reservation->seats()->count();
        $totalPrice = $reservation->total_price;
        $payment = Payment::create([
            'reservation_id' => $reservation->id(),
            'payment_method' => 'stripe',
            'amount' => $totalPrice,
            'status' => 'pending'
        ]);
        \Stripe\Stripe::setApiKey(env('SECRET_KEY'));
        $session = \Stripe\Checkout\Session::create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => 'Cinema Reservation #' . $reservation->id,
                    ],
                    'unit_amount' => $totalPrice * 100,
                ],
                'quantity' => 1,
            ]],
            'success_url' => 'http://127.0.0.1:8000/success',
            'cancel_url' => 'http://127.0.0.1:8000/cancel',

            'metadata' => [
                'payment_id' => $payment->id,
                'reservation_id' => $reservation->id
            ],
        ]);

        return response()->json([
            'url' => $session->url
        ]);
    }
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = env('STRIPE_WEBHOOK_SECRET');

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

                $payment->status = 'success';
                $payment->transaction_id = $session->id;
                $payment->save();

                $reservation = Reservation::find($session->metadata->reservation_id);

                if ($reservation) {
                    $reservation->status = 'paid';
                    $reservation->save();
                }
            }
        }

        return response('Webhook handled', 200);
    }   
}

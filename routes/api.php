<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TicketController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('rooms', RoomController::class);
Route::apiResource('reservations', ReservationController::class);

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('register', [AuthController::class , 'register']);
    Route::post('login', [AuthController::class , 'login']);
    Route::post('google', [AuthController::class , 'googleLogin']);
    Route::post('logout', [AuthController::class , 'logout']);
    Route::post('refresh', [AuthController::class , 'refresh']);
    Route::post('me', [AuthController::class , 'me']);
});



Route::middleware('auth:api')->prefix('profile')->group(function () {
    Route::put('/', [ProfileController::class , 'update']);
    Route::delete('/', [ProfileController::class , 'destroy']);
});
Route::post('/webhook', [PaymentController::class , 'webhook']);
Route::get('/payment/success', [PaymentController::class , 'success'])->name('payment.success');

Route::middleware('auth:api')->group(function () {
    Route::post('/reservations/{id}/checkout', [PaymentController::class , 'checkout'])->name('checkout');
    Route::get('/reservations/{id}/ticket', [TicketController::class , 'show'])->name('tickets.show');
    Route::get('/tickets/{id}/download', [TicketController::class , 'downloadPdf'])->name('tickets.download');
});

// Used for QR Code verification
Route::get('/tickets/{id}/verify', function ($id) {
    return response()->json(['message' => 'Ticket verified', 'reservation_id' => $id]);
})->name('tickets.verify');
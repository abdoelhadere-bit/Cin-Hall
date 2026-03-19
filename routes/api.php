<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SalleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\SeanceController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TicketController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::put('seats/bulk-update', [\App\Http\Controllers\Api\SeatController::class, 'bulkUpdate']);
Route::apiResource('rooms', SalleController::class);
Route::apiResource('reservations', ReservationController::class);

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login'])->name('login');
    Route::post('google', [AuthController::class, 'googleLogin']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('me', [AuthController::class, 'me']);
});



Route::middleware('auth:api')->prefix('profile')->group(function () {
    Route::put('/', [ProfileController::class, 'update']);
    Route::delete('/', [ProfileController::class, 'destroy']);
});
Route::post('/webhook', [PaymentController::class, 'webhook']);

// Films API - Admin routes (auth required + admin check)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('films', FilmController::class);
    Route::apiResource('seances', SeanceController::class);
});
// Films API
Route::apiResource('films', FilmController::class);
Route::apiResource('seances', SeanceController::class);

Route::middleware('auth:api')->group(function () {
    Route::post('/reservations/{id}/checkout', [PaymentController::class, 'checkout'])->name('checkout');
    Route::get('/reservations/{id}/ticket', [TicketController::class, 'show'])->name('tickets.show');
    Route::get('/tickets/{id}/download', [TicketController::class, 'downloadPdf'])->name('tickets.download');
});

// Used for QR Code verification
Route::get('/tickets/{id}/verify', function ($id) {
    return response()->json(['message' => 'Ticket verified', 'reservation_id' => $id]);
})->name('tickets.verify');

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
use App\Http\Controllers\Api\AdminController;

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

Route::get('films', [FilmController::class, 'index']);
Route::get('films/{id}', [FilmController::class, 'show']);
Route::get('seances', [SeanceController::class, 'index']);
Route::get('seances/{id}', [SeanceController::class, 'show']);

Route::post('/webhook', [PaymentController::class, 'webhook']);

Route::get('/tickets/{id}/verify', function ($id) {
    return response()->json(['message' => 'Ticket verified', 'reservation_id' => $id]);
})->name('tickets.verify');

Route::middleware('auth:api')->group(function () {

    Route::prefix('profile')->group(function () {
        Route::put('/', [ProfileController::class, 'update']);
        Route::delete('/', [ProfileController::class, 'destroy']);
    });

    Route::get('rooms', [SalleController::class, 'index']);
    Route::get('rooms/{id}', [SalleController::class, 'show']);

    Route::apiResource('reservations', ReservationController::class);

    // Payment checkout & success
    Route::post('/reservations/{id}/checkout', [PaymentController::class, 'checkout'])->name('checkout');
    Route::get('/payment/success', [PaymentController::class, 'success'])->name('payment.success');

    // Tickets
    Route::get('/reservations/{id}/ticket', [TicketController::class, 'show'])->name('tickets.show');
    Route::get('/tickets/{id}/download', [TicketController::class, 'downloadPdf'])->name('tickets.download');
});

// ─── Admin Routes (auth:api + is_admin) ──────────────────────────
Route::middleware(['auth:api', 'admin'])->group(function () {

    // Film & Seance CRUD (write operations)
    Route::post('films', [FilmController::class, 'store']);
    Route::put('films/{id}', [FilmController::class, 'update']);
    Route::patch('films/{id}', [FilmController::class, 'update']);
    Route::delete('films/{id}', [FilmController::class, 'destroy']);

    Route::post('seances', [SeanceController::class, 'store']);
    Route::put('seances/{id}', [SeanceController::class, 'update']);
    Route::patch('seances/{id}', [SeanceController::class, 'update']);
    Route::delete('seances/{id}', [SeanceController::class, 'destroy']);

    // Room write operations (admin)
    Route::post('rooms', [SalleController::class, 'store']);
    Route::put('rooms/{id}', [SalleController::class, 'update']);
    Route::patch('rooms/{id}', [SalleController::class, 'update']);
    Route::delete('rooms/{id}', [SalleController::class, 'destroy']);

    // Seat bulk type update
    Route::put('seats/bulk-update', [\App\Http\Controllers\Api\SeatController::class, 'bulkUpdate']);

    // Admin dashboard
    Route::prefix('admin')->group(function () {
        Route::get('stats', [AdminController::class, 'stats']);
        Route::get('film-stats', [AdminController::class, 'filmStats']);
        Route::get('users', [AdminController::class, 'users']);
        Route::delete('users/{id}', [AdminController::class, 'deleteUser']);
    });
});

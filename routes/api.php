<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoomController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('rooms', \App\Http\Controllers\Api\RoomController::class);
Route::apiResource('reservations', \App\Http\Controllers\Api\ReservationController::class);

// --- TEST ROUTE FOR EXPIRATION ---
Route::get('/test-expiration', function () {
    // 1. Create a fake user if one doesn't exist
    $user = \App\Models\User::firstOrCreate(
        ['email' => 'test@cinehall.com'],
        ['name' => 'Tester', 'password' => bcrypt('password')]
    );

    // 2. Create a reservation that expired 20 minutes ago
    $reservation = \App\Models\Reservation::create([
        'user_id' => $user->id,
        'total_price' => 20.00,
        'status' => 'pending',
        'expires_at' => now()->subMinutes(20), // Automatically expired!
    ]);

    // 3. Run the command manually so the user can see it work immediately
    \Illuminate\Support\Facades\Artisan::call('reservations:cancel-expired');

    // 4. Check the new status of that exact reservation
    $reservation->refresh();

    return response()->json([
        'message' => 'Test Complete!',
        'original_created_time' => $reservation->created_at,
        'expiration_time_was' => $reservation->expires_at,
        'new_status_after_command_ran' => $reservation->status, // This should now say 'cancelled'
        'command_output' => \Illuminate\Support\Facades\Artisan::output()
    ]);
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;


Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('google', [AuthController::class, 'googleLogin']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('me', [AuthController::class, 'me']);
});



Route::middleware('auth:api')->prefix('profile')->group(function () {
    Route::put('/', [ProfileController::class, 'update']);
    Route::delete('/', [ProfileController::class, 'destroy']);
});

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Film;
use App\Models\Seance;
use App\Models\Reservation;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display global statistics for admin dashboard.
     */
    public function index(Request $request)
    {
        $totalMovies = Film::count();
        $totalSessions = Seance::count();
        $totalReservations = Reservation::count();
$revenue = Payment::where('status', 'success')->sum('amount');

        $popularMovies = Film::select('films.title', DB::raw('COUNT(reservation_seat.seat_id) as tickets_sold'))
            ->join('seances', 'films.id', 'seances.film_id')
            ->join('reservations', 'seances.id', 'reservations.seance_id')
            ->join('reservation_seat', 'reservations.id', 'reservation_seat.reservation_id')
            ->leftJoin('payments', 'reservations.id', 'payments.reservation_id')
            ->where('reservations.status', 'completed')
            ->where('payments.status', 'success')
            ->groupBy('films.id', 'films.title')
            ->orderByDesc('tickets_sold')
            ->limit(10)
            ->get();

        return response()->json([
            'total_movies' => $totalMovies,
            'total_sessions' => $totalSessions,
            'total_reservations' => $totalReservations,
'revenue' => (float) $revenue,
            'popular_movies' => $popularMovies,
        ]);
    }
}


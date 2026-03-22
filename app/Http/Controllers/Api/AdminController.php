<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Film;
use App\Models\Seance;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * General dashboard statistics.
     */
    public function stats()
    {
        return response()->json([
            'total_films'        => Film::count(),
            'total_seances'      => Seance::count(),
            'total_reservations' => Reservation::count(),
            'total_users'        => User::count(),
            'total_revenue'      => Reservation::where('status', 'paid')->sum('total_price'),
            'pending_revenue'    => Reservation::where('status', 'pending')->sum('total_price'),
            'tickets_sold'       => Reservation::where('status', 'paid')->count(),
        ]);
    }

    /**
     * Statistics per film (revenue, popularity, occupation rate).
     */
    public function filmStats()
    {
        $stats = Film::with(['seances.reservations' => function($query) {
                $query->where('status', 'paid')->with('seats');
            }])
            ->get()
            ->map(function ($film) {
                $paidReservations = $film->seances->flatMap->reservations->where('status', 'paid');
                $totalSeatsBooked = $paidReservations->flatMap->seats->count();
                $totalRevenue = $paidReservations->sum('total_price');
                
                // Approximate occupation rate calculation
                $totalCapacity = $film->seances->sum(fn($s) => $s->salle->total_rows * $s->salle->seats_per_row);
                $occupationRate = $totalCapacity > 0 ? round(($totalSeatsBooked / $totalCapacity) * 100, 2) : 0;

                return [
                    'id'              => $film->id,
                    'title'           => $film->title,
                    'total_seances'   => $film->seances->count(),
                    'tickets_sold'    => $totalSeatsBooked,
                    'total_revenue'   => $totalRevenue,
                    'occupation_rate' => $occupationRate . '%',
                ];
            })
            ->sortByDesc('total_revenue')
            ->values();

        return response()->json($stats);
    }

    /**
     * List all users (paginated).
     */
    public function users()
    {
        $users = User::latest()->paginate(20);
        return response()->json($users);
    }

    /**
     * Admin delete a user account.
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'You cannot delete your own admin account.'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }
}

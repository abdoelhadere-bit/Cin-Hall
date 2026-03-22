<?php

namespace App\Http\Controllers;

use App\Models\Seance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SeanceController extends Controller
{
    /**
     * Display a listing of the seances with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Seance::with(['film', 'salle']);

        // Filter by session type: ?type=normal|vip
        if ($type = $request->query('type')) {
            if (in_array($type, ['normal', 'vip'])) {
                $query->where('session_type', $type);
            }
        }

        // Filter by date: ?date=YYYY-MM-DD
        if ($date = $request->query('date')) {
            $query->whereDate('start_time', $date);
        }

        return response()->json($query->get());
    }

    /**
     * Display the specified seance with seat availability.
     */
    public function show($id): JsonResponse
    {
        $seance = Seance::with(['film', 'salle.seats'])->findOrFail($id);

        // Compute reserved seat IDs for this seance
        $reservedSeatIds = $seance->reservations()
            ->whereIn('status', ['pending', 'paid'])
            ->with('seats')
            ->get()
            ->flatMap(fn($r) => $r->seats->pluck('id'))
            ->unique()
            ->values();

        return response()->json([
            'seance'           => $seance,
            'reserved_seat_ids' => $reservedSeatIds,
        ]);
    }

    /**
     * Store a newly created seance in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'film_id'      => 'required|integer|exists:films,id',
            'salle_id'     => 'required|integer|exists:salles,id',
            'start_time'   => 'required|date',
            'end_time'     => 'nullable|date|after:start_time',
            'language'     => 'nullable|string|max:100',
            'session_type' => 'required|in:normal,vip',
            'base_price'   => 'required|numeric|min:0',
        ]);

        $seance = Seance::create($data);

        return response()->json($seance->load(['film', 'salle']), 201);
    }

    /**
     * Update the specified seance in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $seance = Seance::findOrFail($id);

        $data = $request->validate([
            'film_id'      => 'sometimes|integer|exists:films,id',
            'salle_id'     => 'sometimes|integer|exists:salles,id',
            'start_time'   => 'sometimes|date',
            'end_time'     => 'nullable|date|after:start_time',
            'language'     => 'nullable|string|max:100',
            'session_type' => 'sometimes|in:normal,vip',
            'base_price'   => 'sometimes|numeric|min:0',
        ]);

        $seance->update($data);

        return response()->json($seance->load(['film', 'salle']));
    }

    /**
     * Remove the specified seance from storage.
     */
    public function destroy($id): JsonResponse
    {
        $seance = Seance::findOrFail($id);
        $seance->delete();

        return response()->json(null, 204);
    }
}

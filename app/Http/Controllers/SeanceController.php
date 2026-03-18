<?php

namespace App\Http\Controllers;

use App\Models\Seance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SeanceController extends Controller
{
    /**
     * Display a listing of the seances.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Seance::query();

        $type = $request->query('type');
        if ($type) {
            if (in_array($type, ['normal', 'vip'])) {
                $query->where('session_type', $type);
            }
        }

        // Date filter: ?date=YYYY-MM-DD will match seances on that date
        $date = $request->query('date');
        if ($date) {
            $query->whereDate('start_time', $date);
        }

        $seances = $query->get();
        return response()->json($seances);
    }

    /**
     * Display the specified seance.
     */
    public function show($id): JsonResponse
    {
        $seance = Seance::findOrFail($id);
        return response()->json($seance);
    }

    /**
     * Store a newly created seance in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'film_id' => 'required|integer|exists:films,id',
            'salle_id' => 'required|integer|exists:salles,id',
            'start_time' => 'required|date',
            'language' => 'nullable|string',
            'session_type' => 'required|in:normal,vip',
        ]);

        $seance = Seance::create($data);

        return response()->json($seance, 201);
    }

    /**
     * Update the specified seance in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $seance = Seance::findOrFail($id);

        $data = $request->validate([
            'film_id' => 'required|integer|exists:films,id',
            'salle_id' => 'required|integer|exists:salles,id',
            'start_time' => 'required|date',
            'language' => 'nullable|string',
            'session_type' => 'required|in:normal,vip',
        ]);

        $seance->update($data);

        return response()->json($seance);
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

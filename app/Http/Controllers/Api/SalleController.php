<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Salle;
use App\Models\Seat;

class SalleController extends Controller
{
    /**
     * List all rooms with seat counts.
     */
    public function index()
    {
        $salles = Salle::withCount('seats')->get();
        return response()->json($salles);
    }

    /**
     * Show a specific room with its seats.
     */
    public function show(string $id)
    {
        $salle = Salle::with('seats')->findOrFail($id);
        return response()->json($salle);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'total_rows'    => 'required|integer|min:1|max:26',
            'seats_per_row' => 'required|integer|min:1',
        ]);

        $salle = Salle::create($validated);
        $this->generateSeats($salle);

        return response()->json([
            'message' => 'Room and ' . ($salle->total_rows * $salle->seats_per_row) . ' seats created successfully.',
            'room'    => $salle->load('seats')
        ], 201);
    }


    public function update(Request $request, string $id)
    {
        $salle = Salle::findOrFail($id);

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'total_rows'    => 'sometimes|integer|min:1|max:26',
            'seats_per_row' => 'sometimes|integer|min:1',
        ]);

        $dimensionsChanged = isset($validated['total_rows'], $validated['seats_per_row'])
            && ($validated['total_rows'] !== $salle->total_rows
                || $validated['seats_per_row'] !== $salle->seats_per_row);

        $salle->update($validated);

        if ($dimensionsChanged) {
            $salle->seats()->delete();
            $this->generateSeats($salle);
        }

        return response()->json([
            'message' => 'Room updated successfully.',
            'room'    => $salle->load('seats')
        ]);
    }


    public function destroy(string $id)
    {
        $salle = Salle::findOrFail($id);
        $salle->delete();

        return response()->json(['message' => 'Room deleted successfully.']);
    }

    private function generateSeats(Salle $salle): void
    {
        $rows = range('A', 'Z');
        $seatsData = [];

        for ($i = 0; $i < $salle->total_rows; $i++) {
            $rowLetter = $rows[$i];
            for ($j = 1; $j <= $salle->seats_per_row; $j++) {
                $seatsData[] = [
                    'salle_id'    => $salle->id,
                    'row_letter'  => $rowLetter,
                    'seat_number' => $j,
                    'type'        => 'standard',
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ];
            }
        }

        Seat::insert($seatsData);
    }
}

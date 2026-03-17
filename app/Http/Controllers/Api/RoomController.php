<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Seat;    

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'total_rows' => 'required|integer|min:1',
            'seats_per_row' => 'required|integer|min:1',
        ]);

        $room = Room::create($validated);

        // Generate seats automatically
        $rows = range('A', 'Z');
        $seatsData = [];

        for ($i = 0; $i < $room->total_rows; $i++) {
            $rowLetter = $rows[$i];

            for ($j = 1; $j <= $room->seats_per_row; $j++) {
                $seatsData[] = [
                    'room_id' => $room->id,
                    'row_letter' => $rowLetter,
                    'seat_number' => $j,
                    'is_vip' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Insert all seats in one query for better performance
        Seat::insert($seatsData);

        return response()->json([
            'message' => 'Room and ' . count($seatsData) . ' seats created successfully.',
            'room' => $room->load('seats')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

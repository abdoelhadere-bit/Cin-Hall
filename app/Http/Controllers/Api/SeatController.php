<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seat;

class SeatController extends Controller
{
    /**
     * Bulk update seat types (standard, vip, couple)
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'exists:seats,id',
            'type' => 'required|in:standard,vip,couple'
        ]);

        Seat::whereIn('id', $validated['seat_ids'])->update(['type' => $validated['type']]);

        return response()->json([
            'message' => count($validated['seat_ids']) . ' seats successfully updated to ' . $validated['type'] . '.'
        ]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seat extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'row_letter',
        'seat_number',
        'is_vip',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}

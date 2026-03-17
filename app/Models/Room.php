<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'name',
        'total_rows',
        'seats_per_row',
    ];

    public function seats()
    {
        return $this->hasMany(Seat::class);
    }
}

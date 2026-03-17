<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

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

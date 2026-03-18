<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seat extends Model
{
    use HasFactory;

    protected $fillable = [
        'salle_id',
        'row_letter',
        'seat_number',
        'type',
    ];

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }
}

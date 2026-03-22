<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Salle extends Model
{
    use HasFactory;
    protected $table = 'salles';

    protected $fillable = [
        'name',
        'total_rows',
        'seats_per_row',
    ];

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }
}

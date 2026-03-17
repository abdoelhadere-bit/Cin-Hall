<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Film extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'duration',
        'minimum_age',
        'trailer_url',
        'genre',
    ];

    public function seances(): HasMany
    {
        return $this->hasMany(Seance::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'seance_id',
        'total_price',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function seance()
    {
        return $this->belongsTo(Seance::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function seats()
    {
        return $this->belongsToMany(Seat::class)->withTimestamps();
    }

    public function ticket()
    {
        return $this->hasOne(Ticket::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    /** @use HasFactory<\Database\Factories\TicketFactory> */
    use HasFactory;


    protected $fillable = [
        'reservation_id',
        'qr_code',
        'pdf_url'
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    
}

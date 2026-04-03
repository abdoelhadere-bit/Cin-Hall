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

    protected $appends = [
        'qr_code_url',
        'pdf_url_full'
    ];

    public function getQrCodeUrlAttribute()
    {
        return $this->qr_code ? asset('storage/' . $this->qr_code) : null;
    }

    public function getPdfUrlFullAttribute()
    {
        return $this->pdf_url ? asset('storage/' . $this->pdf_url) : null;
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    
}

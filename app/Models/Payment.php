<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Reservation;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory;
    protected $table = 'payment';

    protected $fillable = [
        'reservation_id',
        'payment_method',
        'transaction_id',
        'amount',
        'status',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }


    

}

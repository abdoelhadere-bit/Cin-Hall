<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;

class CancelExpiredReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:cancel-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel pending reservations that have exceeded their 15-minute payment window';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Find all reservations that are pending and their expiration time has passed
        $expiredReservations = Reservation::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->get();

        $count = 0;

        foreach ($expiredReservations as $reservation) {
            $reservation->update(['status' => 'cancelled']);
            
            // Optionally, we could also detach seats entirely if we want them out of the pivot table:
            // $reservation->seats()->detach();

            $count++;
        }

        $this->info("Successfully cancelled {$count} expired reservations.");
    }
}

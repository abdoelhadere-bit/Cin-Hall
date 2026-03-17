<!DOCTYPE html>
<html>
<head>
    <title>Ticket #{{ $reservation->id }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; }
        .ticket { border: 2px solid #000; padding: 20px; width: 400px; margin: 0 auto; }
        .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .details { margin-bottom: 20px; }
        .qr-code { text-align: center; }
        .qr-code img { width: 200px; height: 200px; }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">Cinema Ticket</div>
        <div class="details">
            <p><strong>Reservation ID:</strong> #{{ $reservation->id }}</p>
            <p><strong>User:</strong> {{ $reservation->user->name }}</p>
            <p><strong>Total Price:</strong> ${{ number_format($reservation->total_price, 2) }}</p>
            <p><strong>Seats:</strong> 
                @foreach ($reservation->seats as $seat)
                    {{ $seat->row_letter }}{{ $seat->seat_number }}@if (!$loop->last), @endif
                @endforeach
            </p>
        </div>
        <div class="qr-code">
            <img src="{{ public_path('storage/' . $ticket->qr_code) }}" alt="QR Code">
        </div>
    </div>
</body>
</html>

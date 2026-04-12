/**
 * SeatMap — interactive cinema seat picker
 *
 * Props:
 *   seats: Seat[]           — all seats in the salle
 *   reservedIds: number[]  — already reserved seat IDs
 *   selected: number[]     — currently selected seat IDs
 *   onToggle: (seat) => void
 *   seanceType: 'normal'|'vip'
 *   basePrice: number
 */
export default function SeatMap({ seats, reservedIds, selected, onToggle, seanceType, basePrice }) {
  if (!seats?.length) return null;

  // Group by row
  const rows = {};
  seats.forEach(s => {
    if (!rows[s.row_letter]) rows[s.row_letter] = [];
    rows[s.row_letter].push(s);
  });
  const sortedRows = Object.keys(rows).sort();

  const isReserved = (id) => reservedIds?.includes(id);
  const isSelected = (id) => selected?.includes(id);

  const getSeatStyle = (seat) => {
    const reserved = isReserved(seat.id);
    const sel = isSelected(seat.id);
    const isCouple = seat.type === 'couple';
    const isVipSeat = seat.type === 'vip';

    let bg, border, cursor;

    if (reserved) {
      bg = 'var(--red-dim)'; border = 'var(--red)'; cursor = 'not-allowed';
    } else if (sel) {
      bg = isCouple ? '#a855f7' : 'var(--gold)';
      border = isCouple ? '#c084fc' : '#fbbf44';
      cursor = 'pointer';
    } else if (isCouple) {
      bg = 'var(--purple-dim)'; border = 'var(--purple)'; cursor = 'pointer';
    } else if (isVipSeat) {
      bg = 'var(--gold-dim)'; border = 'rgba(245,166,35,0.4)'; cursor = 'pointer';
    } else {
      bg = 'rgba(255,255,255,0.06)'; border = 'rgba(255,255,255,0.12)'; cursor = 'pointer';
    }

    return { bg, border, cursor };
  };

  const seatSize = 34;
  const seatGap = 6;

  return (
    <div>
      {/* Screen */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-block',
          width: '60%', maxWidth: 400,
          height: 8,
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          borderRadius: 4,
          boxShadow: '0 0 24px rgba(245,166,35,0.3)',
          marginBottom: 8,
        }} />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Écran</p>
      </div>

      {/* Rows */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        {sortedRows.map(row => (
          <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: seatGap, marginBottom: seatGap }}>
            {/* Row label */}
            <span style={{ width: 22, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', flexShrink: 0 }}>
              {row}
            </span>

            {/* Seats */}
            {rows[row]
              .sort((a, b) => a.seat_number - b.seat_number)
              .map(seat => {
                const { bg, border, cursor } = getSeatStyle(seat);
                const reserved = isReserved(seat.id);
                const isCouple = seat.type === 'couple';
                const w = isCouple ? seatSize * 2 + seatGap : seatSize;

                return (
                  <button
                    key={seat.id}
                    title={`${row}${seat.seat_number} (${seat.type})${reserved ? ' — réservé' : ''}`}
                    onClick={() => !reserved && onToggle(seat)}
                    style={{
                      width: w, height: seatSize,
                      background: bg,
                      border: `1.5px solid ${border}`,
                      borderRadius: 6,
                      cursor,
                      fontSize: 10,
                      color: isReserved(seat.id) ? 'var(--red)' : (isSelected(seat.id) ? '#0a0b14' : 'var(--text-muted)'),
                      fontWeight: 600,
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!reserved) e.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {seat.seat_number}
                    {isCouple && !reserved && (
                      <span style={{ fontSize: 8, position: 'absolute', bottom: 1, right: 3 }}>♥♥</span>
                    )}
                  </button>
                );
              })}

            {/* Row label right */}
            <span style={{ width: 22, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', flexShrink: 0 }}>
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="seat-legend" style={{ marginTop: 24 }}>
        {[
          { color: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', label: 'Disponible' },
          { color: 'var(--gold)', border: '#fbbf44', label: 'Sélectionné' },
          { color: 'var(--red-dim)', border: 'var(--red)', label: 'Réservé' },
          { color: 'var(--gold-dim)', border: 'rgba(245,166,35,0.4)', label: 'VIP (+30 MAD)' },
          { color: 'var(--purple-dim)', border: 'var(--purple)', label: 'Couple (×2)' },
        ].map(({ color, border, label }) => (
          <div key={label} className="seat-legend-item">
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: color, border: `1.5px solid ${border}`,
            }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

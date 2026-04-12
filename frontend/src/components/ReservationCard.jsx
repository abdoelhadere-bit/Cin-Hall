import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS = {
  pending:   { label: 'En attente',  cls: 'badge-gold'   },
  paid:      { label: 'Payé',        cls: 'badge-green'  },
  expired:   { label: 'Expiré',      cls: 'badge-grey'   },
  cancelled: { label: 'Annulé',      cls: 'badge-red'    },
};

export default function ReservationCard({ reservation, onCancel }) {
  const s = STATUS[reservation.status] || STATUS.expired;
  const film  = reservation.seance?.film;
  const seance = reservation.seance;
  const seats  = reservation.seats || [];
  const isPending = reservation.status === 'pending';

  const expiresAt = reservation.expires_at ? new Date(reservation.expires_at) : null;
  const notExpired = expiresAt && expiresAt > new Date();

  return (
    <div className="glass-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Poster thumbnail */}
        {film?.image && (
          <img
            src={film.image}
            alt={film.title}
            style={{ width: 60, height: 88, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: '#0d0f1c' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
              {film?.title || `Réservation #${reservation.id}`}
            </h3>
            <span className={`badge ${s.cls}`} style={{ flexShrink: 0 }}>{s.label}</span>
          </div>

          {/* Seance info */}
          {seance?.start_time && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
              🕐 {format(new Date(seance.start_time), "dd MMM yyyy • HH:mm", { locale: fr })}
              {seance.session_type === 'vip' && ' · ⭐ VIP'}
            </p>
          )}

          {/* Seats */}
          {seats.length > 0 && (
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>
              💺 {seats.map(s => `${s.row_letter}${s.seat_number}`).join(', ')}
            </p>
          )}

          {/* Price + expiry */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--gold-text)' }}>
              {reservation.total_price} MAD
            </span>

            {isPending && expiresAt && notExpired && (
              <span style={{ fontSize: 12, color: 'var(--gold-text)', background: 'var(--gold-dim)', padding: '2px 10px', borderRadius: 999 }}>
                ⏱ Expire {formatDistanceToNow(expiresAt, { addSuffix: true, locale: fr })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <Link to={`/reservations/${reservation.id}`} className="btn btn-ghost btn-sm">
          Voir détails
        </Link>
        {reservation.status === 'paid' && reservation.ticket && (
          <Link to={`/reservations/${reservation.id}`} className="btn btn-green btn-sm">
            🎫 Billet
          </Link>
        )}
        {isPending && onCancel && (
          <button onClick={() => onCancel(reservation.id)} className="btn btn-red btn-sm">
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

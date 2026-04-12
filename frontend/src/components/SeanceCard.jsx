import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SeanceCard({ seance, filmTitle }) {
  const isVip = seance.session_type === 'vip';
  const startDate = new Date(seance.start_time);
  const endDate = seance.end_time ? new Date(seance.end_time) : null;

  return (
    <Link to={`/seances/${seance.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass-card" style={{
        padding: '18px 20px',
        cursor: 'pointer',
        borderLeft: `3px solid ${isVip ? 'var(--gold)' : 'var(--blue)'}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {filmTitle && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{filmTitle}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            {/* Date */}
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
              {format(startDate, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
            {/* Time */}
            <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>
              🕐 {format(startDate, "HH:mm")}
              {endDate && ` → ${format(endDate, "HH:mm")}`}
            </p>
            {/* Details */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {seance.language && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🌐 {seance.language}</span>
              )}
              {seance.salle && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {seance.salle.name}</span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span className={`badge ${isVip ? 'badge-gold' : 'badge-blue'}`} style={{ marginBottom: 8, display: 'inline-flex' }}>
              {isVip ? '⭐ VIP' : '🎬 Normal'}
            </span>
            <p style={{ fontSize: 18, fontWeight: 700, color: isVip ? 'var(--gold-text)' : 'var(--text-heading)' }}>
              {seance.base_price} <span style={{ fontSize: 12, fontWeight: 400 }}>MAD</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

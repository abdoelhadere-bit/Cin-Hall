import { Link } from 'react-router-dom';

const PLACEHOLDER = 'https://via.placeholder.com/300x420/13162a/f5a623?text=🎬';

const genreColors = {
  Action: '#e63946', Drama: '#3b82f6', Comedy: '#22c55e',
  Horror: '#a855f7', Romance: '#ec4899', Thriller: '#f5a623',
  'Sci-Fi': '#06b6d4', Animation: '#f59e0b', default: '#6b7280',
};

export default function FilmCard({ film }) {
  const genreColor = genreColors[film.genre] || genreColors.default;

  return (
    <Link to={`/films/${film.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass-card fade-in" style={{
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.25s, box-shadow 0.25s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Poster */}
        <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: '#0d0f1c' }}>
          <img
            src={film.image || PLACEHOLDER}
            alt={film.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
            onError={e => { e.target.src = PLACEHOLDER; }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
          />
          {/* Age badge */}
          {film.minimum_age && (
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: film.minimum_age >= 18 ? 'var(--red)' : 'var(--gold)',
              color: film.minimum_age >= 18 ? '#fff' : '#0a0b14',
              borderRadius: 6, padding: '2px 8px',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
            }}>
              {film.minimum_age}+
            </div>
          )}
          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(8,11,20,0.95) 0%, transparent 50%)',
            opacity: 0, transition: 'opacity 0.3s',
          }}
            className="film-overlay"
          />
        </div>

        {/* Info */}
        <div style={{ padding: '14px 14px 16px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {film.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, fontWeight: 600, color: genreColor,
              background: `${genreColor}20`, padding: '2px 8px', borderRadius: 999,
            }}>
              {film.genre}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {film.duration} min
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

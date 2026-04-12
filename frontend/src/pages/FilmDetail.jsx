import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api';
import SeanceCard from '../components/SeanceCard';

export default function FilmDetail() {
  const { id } = useParams();
  const [film, setFilm]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    api.get(`/films/${id}`)
      .then(r => setFilm(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!film) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>🎬</p>
      <p>Film introuvable.</p>
      <Link to="/films" className="btn btn-ghost" style={{ marginTop: 16 }}>← Retour aux films</Link>
    </div>
  );

  const seances = film.seances || [];
  const filtered = filter === 'all' ? seances : seances.filter(s => s.session_type === filter);

  // Extract YouTube ID for embedding
  const getYoutubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=)([^&?/]+)/);
    return m ? m[1] : null;
  };
  const ytId = getYoutubeId(film.trailer_url);

  return (
    <div className="page" style={{ padding: '0 0 80px' }}>
      {/* Hero backdrop */}
      <div style={{
        position: 'relative', minHeight: 420,
        background: film.image
          ? `linear-gradient(to bottom, rgba(8,11,20,0.3) 0%, rgba(8,11,20,1) 100%), url(${film.image}) center/cover no-repeat`
          : 'linear-gradient(135deg, rgba(245,166,35,0.05), rgba(168,85,247,0.05))',
        display: 'flex', alignItems: 'flex-end',
        padding: '0 0 48px',
      }}>
        <div className="container" style={{ display: 'flex', gap: 36, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Poster */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={film.image || 'https://via.placeholder.com/220x330/13162a/f5a623?text=🎬'}
              alt={film.title}
              style={{ width: 180, height: 270, objectFit: 'cover', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,0.6)', border: '2px solid var(--border)' }}
              onError={e => { e.target.src = 'https://via.placeholder.com/220x330/13162a/f5a623?text=🎬'; }}
            />
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 24 }}>
            <Link to="/films" style={{ color: 'var(--text-muted)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
              ← Retour aux films
            </Link>
            <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', marginBottom: 12 }}>{film.title}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
              {film.genre && <span className="badge badge-blue">{film.genre}</span>}
              {film.minimum_age && (
                <span className={`badge ${film.minimum_age >= 18 ? 'badge-red' : 'badge-gold'}`}>
                  {film.minimum_age}+
                </span>
              )}
              {film.duration && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>⏱ {film.duration} min</span>}
            </div>
            {film.description && (
              <p style={{ color: 'var(--text)', lineHeight: 1.7, maxWidth: 560, marginBottom: 20 }}>
                {film.description}
              </p>
            )}
            {film.trailer_url && (
              <button onClick={() => setTrailerOpen(true)} className="btn btn-ghost">
                ▶ Voir la bande-annonce
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trailer modal */}
      {trailerOpen && (
        <div onClick={() => setTrailerOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 900 }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000', borderRadius: 12, overflow: 'hidden' }}>
              {ytId ? (
                <iframe
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                  allow="autoplay; fullscreen"
                  title="Bande-annonce"
                />
              ) : (
                <video controls autoPlay style={{ width: '100%', height: '100%' }} src={film.trailer_url} />
              )}
            </div>
            <button onClick={() => setTrailerOpen(false)} className="btn btn-ghost" style={{ marginTop: 14, width: '100%' }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Seances section */}
      <div className="container" style={{ marginTop: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Séances disponibles</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['all','Toutes'], ['normal','Normal'], ['vip','VIP']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} className={`btn btn-sm ${filter === v ? 'btn-gold' : 'btn-ghost'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p>Aucune séance disponible{filter !== 'all' ? ` pour ce type` : ''}.</p>
          </div>
        ) : (
          <div className="grid-seances">
            {filtered.map(s => <SeanceCard key={s.id} seance={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import FilmCard from '../components/FilmCard';

export default function Home() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/films').then(r => setFilms(r.data.slice(0, 6))).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '88vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', textAlign: 'center',
        padding: '60px 24px',
      }}>
        {/* Animated background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '10%', left: '5%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)',
            animation: 'pulse 6s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '5%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)',
            animation: 'pulse 8s ease-in-out infinite reverse',
          }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{ marginBottom: 24 }}>
            <span className="badge badge-gold" style={{ fontSize: 13, padding: '6px 18px' }}>
              🎬 Réservation en ligne
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(42px, 7vw, 80px)', lineHeight: 1.1, marginBottom: 24, fontWeight: 800 }}>
            Votre expérience<br />
            <span className="text-gradient">cinéma</span> réinventée
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Choisissez vos films, sélectionnez vos sièges et vivez une expérience cinématographique unique.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/films" className="btn btn-gold btn-lg">
              🎞️ Voir les films
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              S'inscrire gratuitement
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 60, flexWrap: 'wrap' }}>
            {[['🎬', 'Films à l\'affiche', films.length || '—'],
              ['💺', 'Sièges premium', 'VIP & Couple'],
              ['⚡', 'Réservation', '100% en ligne'],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>{val}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section style={{ padding: '60px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <h2 className="section-title">Films à l'affiche</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Les dernières nouveautés du cinéma</p>
            </div>
            <Link to="/films" className="btn btn-ghost" style={{ flexShrink: 0 }}>
              Voir tout →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" />
            </div>
          ) : films.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🎬</p>
              <p>Aucun film disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid-films">
              {films.map(film => <FilmCard key={film.id} film={film} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,166,35,0.12), rgba(168,85,247,0.08))',
            border: '1px solid rgba(245,166,35,0.2)',
            borderRadius: 20, padding: '48px 40px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 32, marginBottom: 14 }}>Prêt à réserver vos places ?</h2>
            <p style={{ color: 'var(--text)', marginBottom: 28, fontSize: 16 }}>
              Créez votre compte et profitez d'une expérience de réservation fluide et rapide.
            </p>
            <Link to="/register" className="btn btn-gold btn-lg">
              Commencer maintenant →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
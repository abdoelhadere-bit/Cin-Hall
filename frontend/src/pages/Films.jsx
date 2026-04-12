import { useEffect, useState } from 'react';
import api from '../api';
import FilmCard from '../components/FilmCard';

const GENRES = ['Tous', 'Action', 'Drama', 'Comedy', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Animation'];

export default function Films() {
  const [films, setFilms]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [genre, setGenre]       = useState('Tous');

  useEffect(() => {
    api.get('/films')
      .then(r => { setFilms(r.data); setFiltered(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = films;
    if (genre !== 'Tous') result = result.filter(f => f.genre === genre);
    if (search.trim()) result = result.filter(f => f.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, genre, films]);

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', marginBottom: 10, fontWeight: 800 }}>
            Catalogue <span className="text-gradient">films</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Découvrez tous les films disponibles à la réservation</p>
        </div>

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            <input
              className="form-input"
              style={{ paddingLeft: 42 }}
              placeholder="Rechercher un film..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`btn btn-sm ${genre === g ? 'btn-gold' : 'btn-ghost'}`}
                style={{ padding: '6px 14px', borderRadius: 999 }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            {filtered.length} film{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🎬</p>
            <p style={{ fontSize: 18 }}>Aucun film trouvé</p>
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => { setSearch(''); setGenre('Tous'); }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid-films">
            {filtered.map(film => <FilmCard key={film.id} film={film} />)}
          </div>
        )}
      </div>
    </div>
  );
}
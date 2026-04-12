import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';

export default function AdminFilms() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '', duration: '', genre: '', description: '', image: '', minimum_age: '', trailer_url: ''
  });

  const loadFilms = () => {
    setLoading(true);
    api.get('/films')
      .then(r => setFilms(r.data))
      .catch(() => toast.error('Impossible de charger les films.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFilms(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce film ? Toutes ses séances seront potentiellement affectées.')) return;
    try {
      await api.delete(`/films/${id}`);
      toast.success('Film supprimé.');
      loadFilms();
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/films', {
        ...formData,
        duration: parseInt(formData.duration),
        minimum_age: formData.minimum_age ? parseInt(formData.minimum_age) : null,
      });
      toast.success('Film ajouté avec succès !');
      setAdding(false);
      setFormData({ title: '', duration: '', genre: '', description: '', image: '', minimum_age: '', trailer_url: '' });
      loadFilms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Gestion des Films</h1>
          <p style={{ color: 'var(--text-muted)' }}>{films.length} films dans le catalogue</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn btn-gold">
          {adding ? 'Annuler' : '+ Ajouter un film'}
        </button>
      </div>

      {adding && (
        <div className="glass-card fade-in" style={{ padding: 24, marginBottom: 24, borderLeft: '4px solid var(--gold)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Nouveau film</h2>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Titre du film</label>
              <input className="form-input" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Durée (minutes)</label>
              <input className="form-input" type="number" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <input className="form-input" required value={formData.genre} onChange={e => setFormData({ ...formData, genre: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Âge minimum</label>
              <input className="form-input" type="number" placeholder="Ex: 12" value={formData.minimum_age} onChange={e => setFormData({ ...formData, minimum_age: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">URL de l'image (Affiche)</label>
              <input className="form-input" type="url" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">URL de la bande-annonce (YouTube)</label>
              <input className="form-input" type="url" value={formData.trailer_url} onChange={e => setFormData({ ...formData, trailer_url: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button type="button" onClick={() => setAdding(false)} className="btn btn-ghost">Annuler</button>
              <button type="submit" disabled={saving} className="btn btn-gold">
                {saving ? 'Enregistrement...' : '💾 Enregistrer le film'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Affiche</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Titre</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Genre & Durée</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {films.map(film => (
                <tr key={film.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px' }}>
                    {film.image ? (
                      <img src={film.image} alt={film.title} style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <div style={{ width: 44, height: 60, background: '#222', borderRadius: 4 }} />
                    )}
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: 500 }}>{film.title}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>
                    {film.genre} • {film.duration}m
                    {film.minimum_age && <span className="badge badge-red" style={{ marginLeft: 8 }}>{film.minimum_age}+</span>}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(film.id)} className="btn btn-sm btn-ghost" style={{ color: 'var(--red)', border: '1px solid rgba(230,57,70,0.3)' }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {films.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Aucun film disponible.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';

export default function AdminSalles() {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', total_rows: 10, seats_per_row: 10 });

  const loadSalles = () => {
    setLoading(true);
    api.get('/rooms')
      .then(r => setSalles(r.data))
      .catch(() => toast.error('Impossible de charger les salles.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSalles(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette salle ? Toutes ses séances et sièges seront supprimés.')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Salle supprimée.');
      loadSalles();
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/rooms', {
        name: formData.name,
        total_rows: parseInt(formData.total_rows),
        seats_per_row: parseInt(formData.seats_per_row)
      });
      toast.success('Salle créée avec ses sièges.');
      setAdding(false);
      setFormData({ name: '', total_rows: 10, seats_per_row: 10 });
      loadSalles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Gestion des Salles</h1>
          <p style={{ color: 'var(--text-muted)' }}>{salles.length} salles configurées</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn btn-gold">
          {adding ? 'Annuler' : '+ Ajouter une salle'}
        </button>
      </div>

      {adding && (
        <div className="glass-card fade-in" style={{ padding: 24, marginBottom: 24, borderLeft: '4px solid var(--gold)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Nouvelle Salle</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 2, minWidth: 200, marginBottom: 0 }}>
              <label className="form-label">Nom de la salle</label>
              <input className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Salle 1 (IMAX)" />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
              <label className="form-label">Rangées (A-Z)</label>
              <input className="form-input" type="number" min="1" max="26" required value={formData.total_rows} onChange={e => setFormData({ ...formData, total_rows: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
              <label className="form-label">Sièges / Rangs</label>
              <input className="form-input" type="number" min="1" max="50" required value={formData.seats_per_row} onChange={e => setFormData({ ...formData, seats_per_row: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="btn btn-gold" style={{ height: 42 }}>
              {saving ? '...' : 'Générer la salle'}
            </button>
          </form>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
            La création de la salle générera automatiquement tous ses sièges par défaut (Normal). Vous pourrez ensuite les éditer.
          </p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Nom</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Capacité Globale</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Dimensions</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salles.map(salle => (
                <tr key={salle.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>{salle.name}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span className="badge badge-purple">{salle.seats_count || (salle.total_rows * salle.seats_per_row)} sièges</span>
                  </td>
                  <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>
                    {salle.total_rows} rangées × {salle.seats_per_row} cols
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link to={`/admin/salles/${salle.id}/sieges`} className="btn btn-sm btn-ghost">
                        💺 Gérer disposition
                      </Link>
                      <button onClick={() => handleDelete(salle.id)} className="btn btn-sm btn-ghost" style={{ color: 'var(--red)', border: '1px solid rgba(230,57,70,0.3)' }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {salles.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Aucune salle disponible.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

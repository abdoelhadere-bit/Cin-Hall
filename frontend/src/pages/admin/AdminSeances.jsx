import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../api';

export default function AdminSeances() {
  const [seances, setSeances] = useState([]);
  const [films, setFilms] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    film_id: '',
    salle_id: '',
    start_time: '',
    end_time: '',
    language: 'VF',
    session_type: 'normal',
    base_price: 50
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resSeances, resFilms, resSalles] = await Promise.all([
        api.get('/seances'),
        api.get('/films'),
        api.get('/rooms')
      ]);
      setSeances(resSeances.data);
      setFilms(resFilms.data);
      setSalles(resSalles.data);
      if (resFilms.data.length > 0 && resSalles.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          film_id: resFilms.data[0].id,
          salle_id: resSalles.data[0].id
        }));
      }
    } catch {
      toast.error('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette séance ? Toutes les réservations associées seront impactées.')) return;
    try {
      await api.delete(`/seances/${id}`);
      toast.success('Séance supprimée.');
      loadData();
    } catch {
      toast.error('Erreur de suppression.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        film_id: parseInt(formData.film_id),
        salle_id: parseInt(formData.salle_id),
        base_price: parseFloat(formData.base_price),
      };
      if (!payload.end_time) delete payload.end_time;
      
      await api.post('/seances', payload);
      toast.success('Séance programmée.');
      setAdding(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la programmation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Programmation (Séances)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les horaires des films</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn btn-gold">
          {adding ? 'Annuler' : '+ Programmer une séance'}
        </button>
      </div>

      {adding && (
        <div className="glass-card fade-in" style={{ padding: 24, marginBottom: 24, borderLeft: '4px solid var(--gold)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Nouvelle Séance</h2>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px 20px' }}>
            <div className="form-group">
              <label className="form-label">Film</label>
              <select className="form-input" required value={formData.film_id} onChange={e => setFormData({ ...formData, film_id: e.target.value })}>
                {films.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Salle</label>
              <select className="form-input" required value={formData.salle_id} onChange={e => setFormData({ ...formData, salle_id: e.target.value })}>
                {salles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Début</label>
              <input className="form-input" type="datetime-local" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Fin (Optionnel)</label>
              <input className="form-input" type="datetime-local" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Type d'expérience</label>
              <select className="form-input" required value={formData.session_type} onChange={e => setFormData({ ...formData, session_type: e.target.value })}>
                <option value="normal">Normal</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Langue</label>
              <input className="form-input" required value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} placeholder="VOSTFR, VF..." />
            </div>

            <div className="form-group">
              <label className="form-label">Tarif de base (MAD)</label>
              <input className="form-input" type="number" required value={formData.base_price} onChange={e => setFormData({ ...formData, base_price: e.target.value })} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" disabled={saving || films.length===0 || salles.length===0} className="btn btn-gold">
                {saving ? 'Plannification...' : '💾 Programmer'}
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
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Film & Horaire</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Salle & Type</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Tarif de base</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {seances.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{s.film?.title || 'Film supprimé'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      {format(new Date(s.start_time), "EEEE d MMM yyyy à HH:mm", { locale: fr })}
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div>{s.salle?.name || 'Salle supprimée'}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span className={`badge ${s.session_type === 'vip' ? 'badge-gold' : 'badge-blue'}`}>{s.session_type.toUpperCase()}</span>
                      <span className="badge badge-grey">{s.language}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: 500, color: 'var(--gold-text)' }}>
                    {s.base_price} MAD
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(s.id)} className="btn btn-sm btn-ghost" style={{ color: 'var(--red)', border: '1px solid rgba(230,57,70,0.3)' }}>
                      Annuler
                    </button>
                  </td>
                </tr>
              ))}
              {seances.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Aucune séance programmée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

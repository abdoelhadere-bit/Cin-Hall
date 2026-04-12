import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
      <div className="spinner" />
    </div>
  );

  if (!stats) return null;

  const kpis = [
    { label: 'Revenus Validés', value: `${stats.total_revenue || 0} MAD`, color: 'var(--green)' },
    { label: 'Revenus en attente', value: `${stats.pending_revenue || 0} MAD`, color: 'var(--gold)' },
    { label: 'Billets vendus', value: stats.tickets_sold, color: 'var(--purple)' },
    { label: 'Réservations totales', value: stats.total_reservations, color: '#3b82f6' },
    { label: 'Films en catalogue', value: stats.total_films, color: '#ec4899' },
    { label: 'Séances programmées', value: stats.total_seances, color: '#f97316' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Tableau de bord</h1>
        <p style={{ color: 'var(--text-muted)' }}>Bienvenue dans l'espace d'administration de CinéHall.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20
      }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="glass-card" style={{
            padding: '24px',
            borderLeft: `4px solid ${kpi.color}`,
            background: `linear-gradient(135deg, ${kpi.color}11, transparent)`
          }}>
            <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
              {kpi.label}
            </p>
            <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-heading)' }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {stats.total_users !== undefined && (
        <div style={{ marginTop: 32 }} className="glass-card">
          <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>Utilisateurs inscrits</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold-text)' }}>{stats.total_users}</span>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import ReservationCard from '../components/ReservationCard';

const TABS = [
  { key: 'all',       label: 'Toutes'        },
  { key: 'pending',   label: 'En attente'    },
  { key: 'paid',      label: 'Payées'        },
  { key: 'expired',   label: 'Expirées'      },
  { key: 'cancelled', label: 'Annulées'      },
];

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState('all');

  const load = () => {
    setLoading(true);
    api.get('/reservations')
      .then(r => setReservations(r.data))
      .catch(() => toast.error('Impossible de charger vos réservations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    try {
      await api.put(`/reservations/${reservationId}`, {});
      toast.success('Réservation annulée.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Impossible d\'annuler.');
    }
  };

  const filtered = tab === 'all' ? reservations : reservations.filter(r => r.status === tab);

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? reservations.length : reservations.filter(r => r.status === t.key).length;
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, marginBottom: 8 }}>
            Mes réservations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Gérez toutes vos réservations de billets de cinéma
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`btn btn-sm ${tab === t.key ? 'btn-gold' : 'btn-ghost'}`}
              style={{ borderRadius: 999 }}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span style={{
                  background: tab === t.key ? 'rgba(0,0,0,0.2)' : 'var(--border)',
                  color: tab === t.key ? '#0a0b14' : 'var(--text-muted)',
                  borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700,
                }}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🎫</p>
            <p style={{ fontSize: 18, marginBottom: 8 }}>
              {tab === 'all' ? 'Aucune réservation pour le moment' : `Aucune réservation ${TABS.find(t => t.key === tab)?.label.toLowerCase()}`}
            </p>
            {tab === 'all' && (
              <Link to="/films" className="btn btn-gold" style={{ marginTop: 16 }}>
                🎬 Explorer les films
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(r => (
              <ReservationCard key={r.id} reservation={r} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

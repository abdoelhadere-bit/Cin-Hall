import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';

export default function AdminSieges() {
  const { id } = useParams();
  const [salle, setSalle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedTools, setSelectedTools] = useState('vip');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadSalle = () => {
    setLoading(true);
    api.get(`/rooms/${id}`)
      .then(r => setSalle(r.data))
      .catch(() => toast.error('Impossible de charger la salle.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSalle(); }, [id]);

  const handleSeatClick = (seatId) => {
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(x => x !== seatId) : [...prev, seatId]
    );
  };

  const handleApply = async () => {
    if (selectedSeats.length === 0) return;
    setSaving(true);
    try {
      await api.put('/seats/bulk-update', {
        seat_ids: selectedSeats,
        type: selectedTools
      });
      toast.success(`${selectedSeats.length} sièges modifiés en ${selectedTools}.`);
      setSelectedSeats([]);
      loadSalle();
    } catch {
      toast.error('Erreur lors de la mise à jour des sièges.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>;
  if (!salle) return <p>Salle introuvable.</p>;

  // Group seats by row
  const rows = {};
  salle.seats.forEach(s => {
    if (!rows[s.row_letter]) rows[s.row_letter] = [];
    rows[s.row_letter].push(s);
  });
  const sortedRows = Object.keys(rows).sort();
  const seatSize = 40;
  const seatGap = 8;

  const getSeatStyle = (seat) => {
    const isEditing = selectedSeats.includes(seat.id);
    const type = seat.type;
    
    let bg, border;
    if (isEditing) {
      bg = '#e2e8f0'; border = '#94a3b8'; // Highlight for selected
    } else if (type === 'couple') {
      bg = 'var(--purple-dim)'; border = 'var(--purple)';
    } else if (type === 'vip') {
      bg = 'var(--gold-dim)'; border = 'rgba(245,166,35,0.4)';
    } else {
      bg = 'rgba(255,255,255,0.06)'; border = 'rgba(255,255,255,0.12)';
    }
    return { bg, border };
  };

  return (
    <div>
      <Link to="/admin/salles" style={{ color: 'var(--text-muted)', marginBottom: 24, display: 'inline-block' }}>
        ← Retour aux salles
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Aménagement : {salle.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{salle.seats.length} sièges au total</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Toolbox */}
        <div className="glass-card" style={{ padding: 24, width: 300 }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Outils d'édition</h3>
          
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            1. Choisissez le type à appliquer :
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {[
              { id: 'standard', label: 'Standard', color: 'var(--text)', border: 'var(--border)' },
              { id: 'vip', label: 'VIP', color: 'var(--gold)', border: 'var(--gold)' },
              { id: 'couple', label: 'Couple (x2)', color: 'var(--purple)', border: 'var(--purple)' },
            ].map(t => (
              <label key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8,
                border: `1px solid ${selectedTools === t.id ? t.border : 'var(--border)'}`,
                background: selectedTools === t.id ? `${t.border}11` : 'transparent',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <input type="radio" name="tool" value={t.id} checked={selectedTools === t.id} onChange={e => setSelectedTools(e.target.value)} />
                <span style={{ fontWeight: selectedTools === t.id ? 600 : 400 }}>{t.label}</span>
              </label>
            ))}
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
            2. Sélectionnez les sièges sur le plan (<strong>{selectedSeats.length}</strong> cliqués)
          </p>

          <button
            onClick={handleApply}
            disabled={saving || selectedSeats.length === 0}
            className="btn btn-gold" style={{ width: '100%' }}
          >
            {saving ? 'Application...' : `Appliquer [${selectedTools.toUpperCase()}]`}
          </button>
        </div>

        {/* Seat Map */}
        <div className="glass-card" style={{ padding: 32, flex: 1, overflowX: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Screen */}
          <div style={{ textAlign: 'center', marginBottom: 36, width: '100%' }}>
            <div style={{
              display: 'inline-block', width: '80%', maxWidth: 500, height: 8,
              background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
              borderRadius: 4
            }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8 }}>Écran</p>
          </div>

          <div>
            {sortedRows.map(row => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: seatGap, marginBottom: seatGap }}>
                <span style={{ width: 24, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>{row}</span>
                {rows[row].sort((a, b) => a.seat_number - b.seat_number).map(seat => {
                  const { bg, border } = getSeatStyle(seat);
                  const isCouple = seat.type === 'couple';
                  // Even if couple, visually on admin map we might treat them individually to assign them, 
                  // but to match frontend we make them slightly wider if they are already couple.
                  const w = isCouple ? (seatSize * 2) - 10 : seatSize;

                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      title={`${row}${seat.seat_number} - Type actuel: ${seat.type}`}
                      style={{
                        width: w, height: seatSize,
                        background: bg, border: `2px solid ${border}`, borderRadius: 8,
                        cursor: 'pointer', transition: 'all 0.1s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: selectedSeats.includes(seat.id) ? '#000' : 'var(--text-muted)', fontSize: 12, fontWeight: 700
                      }}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
                <span style={{ width: 24, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>{row}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, differenceInSeconds } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../api';
import SeatMap from '../components/SeatMap';
import { useAuth } from '../contexts/AuthContext';

function Countdown({ expiresAt }) {
  const [secs, setSecs] = useState(() => differenceInSeconds(new Date(expiresAt), new Date()));
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (secs <= 0) return <span style={{ color: 'var(--red)' }}>Expirée !</span>;
  const m = Math.floor(secs / 60), s = secs % 60;
  const urgent = secs < 120;
  return (
    <span style={{ color: urgent ? 'var(--red)' : 'var(--gold-text)', fontWeight: 700 }}>
      {m}:{String(s).padStart(2, '0')}
    </span>
  );
}

export default function SeanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    api.get(`/seances/${id}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Impossible de charger la séance.'))
      .finally(() => setLoading(false));
  }, [id]);

  const seance = data?.seance;
  const seats  = seance?.salle?.seats || [];
  const reservedIds = data?.reserved_seat_ids || [];

  const handleToggle = (seat) => {
    // Couple seats: auto-select both seats in same couple pair
    if (seat.type === 'couple') {
      // Find paired seat (same row, adjacent seat numbers that are couples)
      const rowSeats = seats.filter(s => s.row_letter === seat.row_letter && s.type === 'couple');
      const idx = rowSeats.findIndex(s => s.id === seat.id);
      const paired = idx % 2 === 0 ? rowSeats[idx + 1] : rowSeats[idx - 1];

      const ids = [seat.id, ...(paired ? [paired.id] : [])];
      const alreadySelected = selected.includes(seat.id);

      if (alreadySelected) {
        setSelected(prev => prev.filter(x => !ids.includes(x)));
      } else {
        setSelected(prev => [...prev.filter(x => !ids.includes(x)), ...ids]);
      }
      return;
    }
    // Normal / VIP seats
    setSelected(prev =>
      prev.includes(seat.id) ? prev.filter(x => x !== seat.id) : [...prev, seat.id]
    );
  };

  const calcTotal = () => {
    if (!seance) return 0;
    return selected.reduce((sum, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      if (!seat) return sum;
      if (seat.type === 'vip') return sum + seance.base_price + 30;
      if (seat.type === 'couple') return sum + seance.base_price * 2;
      return sum + seance.base_price;
    }, 0);
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour réserver.');
      navigate('/login');
      return;
    }
    if (selected.length === 0) {
      toast.error('Veuillez sélectionner au moins un siège.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/reservations', { seance_id: parseInt(id), seat_ids: selected });
      setReservation(res.data.reservation);
      toast.success('Réservation créée ! Procédez au paiement dans 15 minutes.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!seance) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
      <p>Séance introuvable.</p>
      <Link to="/films" className="btn btn-ghost" style={{ marginTop: 16 }}>← Films</Link>
    </div>
  );

  const film = seance.film || {};
  const salle = seance.salle || {};
  const isVip = seance.session_type === 'vip';
  const total = calcTotal();

  if (reservation) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 620, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🎟️</div>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>Réservation confirmée !</h1>
          <p style={{ color: 'var(--text)', marginBottom: 32 }}>
            Votre réservation a été créée. Vous avez{' '}
            <Countdown expiresAt={reservation.expires_at} />{' '}
            pour finaliser le paiement.
          </p>

          <div className="glass-card" style={{ padding: '20px 24px', textAlign: 'left', marginBottom: 28 }}>
            <p><strong>Film :</strong> {film.title}</p>
            <p><strong>Sièges :</strong> {reservation.seats?.map(s => `${s.row_letter}${s.seat_number}`).join(', ')}</p>
            <p><strong>Total :</strong> {reservation.total_price} MAD</p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-gold btn-lg"
              onClick={() => navigate(`/reservations/${reservation.id}`)}
            >
              💳 Procéder au paiement
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/reservations')}>
              Mes réservations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Back link */}
        <Link to={`/films/${film.id}`} style={{ color: 'var(--text-muted)', fontSize: 14, display: 'inline-flex', gap: 4, marginBottom: 28 }}>
          ← {film.title}
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
          {/* Seance info header */}
          <div className="glass-card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {film.image && (
                <img src={film.image} alt={film.title} style={{ width: 80, height: 120, objectFit: 'cover', borderRadius: 8 }}
                  onError={e => { e.target.style.display = 'none'; }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span className={`badge ${isVip ? 'badge-gold' : 'badge-blue'}`}>
                    {isVip ? '⭐ VIP' : '🎬 Normal'}
                  </span>
                  {seance.language && <span className="badge badge-grey">{seance.language}</span>}
                </div>
                <h1 style={{ fontSize: 26, marginBottom: 8 }}>{film.title}</h1>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', color: 'var(--text)', fontSize: 14 }}>
                  <span>📅 {format(new Date(seance.start_time), "EEEE d MMMM yyyy • HH:mm", { locale: fr })}</span>
                  {seance.end_time && <span>🔚 {format(new Date(seance.end_time), "HH:mm")}</span>}
                  {salle.name && <span>📍 {salle.name}</span>}
                  <span>💰 À partir de {seance.base_price} MAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seat map */}
          <div className="glass-card" style={{ padding: '32px 24px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: 20 }}>Choisissez vos sièges</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
              {seats.length} sièges au total · {reservedIds.length} déjà réservés
            </p>

            <SeatMap
              seats={seats}
              reservedIds={reservedIds}
              selected={selected}
              onToggle={handleToggle}
              seanceType={seance.session_type}
              basePrice={seance.base_price}
            />
          </div>

          {/* Summary & action */}
          {selected.length > 0 && (
            <div className="glass-card fade-in" style={{ padding: '20px 24px' }}>
              <h3 style={{ marginBottom: 12, fontSize: 18 }}>Récapitulatif</h3>
              <div style={{ marginBottom: 8 }}>
                {selected.map(seatId => {
                  const seat = seats.find(s => s.id === seatId);
                  if (!seat) return null;
                  const price = seat.type === 'vip' ? seance.base_price + 30
                    : seat.type === 'couple' ? seance.base_price * 2
                    : seance.base_price;
                  return (
                    <div key={seatId} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                      <span>Siège {seat.row_letter}{seat.seat_number} <span className={`badge badge-${seat.type === 'vip' ? 'gold' : seat.type === 'couple' ? 'purple' : 'grey'}`} style={{ fontSize: 10 }}>{seat.type}</span></span>
                      <span style={{ fontWeight: 600 }}>{price} MAD</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>Total : <span style={{ color: 'var(--gold-text)' }}>{total} MAD</span></span>
                <button
                  onClick={handleReserve}
                  disabled={submitting || selected.length === 0}
                  className="btn btn-gold btn-lg"
                >
                  {submitting ? 'Traitement...' : '🎫 Réserver'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

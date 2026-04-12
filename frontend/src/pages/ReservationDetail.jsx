import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { format, differenceInSeconds } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../api';

const STATUS = {
  pending:   { label: 'En attente de paiement', cls: 'badge-gold',   emoji: '⏳' },
  paid:      { label: 'Payé',                    cls: 'badge-green',  emoji: '✅' },
  expired:   { label: 'Expiré',                  cls: 'badge-grey',   emoji: '⌛' },
  cancelled: { label: 'Annulé',                  cls: 'badge-red',    emoji: '❌' },
};

function Countdown({ expiresAt }) {
  const [secs, setSecs] = useState(() => differenceInSeconds(new Date(expiresAt), new Date()));
  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [secs]);
  if (secs <= 0) return <span style={{ color: 'var(--red)' }}>Expirée !</span>;
  const m = Math.floor(secs / 60), s = secs % 60;
  return <span style={{ color: secs < 120 ? 'var(--red)' : 'var(--gold-text)', fontWeight: 700 }}>{m}:{String(s).padStart(2, '0')}</span>;
}

export default function ReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [ticket, setTicket]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [simulating, setSimulating]   = useState(false);
  const [cancelling, setCancelling]   = useState(false);

  const loadData = async () => {
    try {
      const res = await api.get(`/reservations/${id}`);
      setReservation(res.data);
      if (res.data.status === 'paid') {
        try {
          const t = await api.get(`/reservations/${id}/ticket`);
          setTicket(t.data.ticket);
        } catch {}
      }
    } catch {
      toast.error('Réservation introuvable.');
      navigate('/reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleSimulatePayment = async () => {
    setSimulating(true);
    try {
      await api.post(`/reservations/${id}/simulate-payment`);
      toast.success('Paiement simulé avec succès ! Billet généré.');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du paiement simulé.');
    } finally {
      setSimulating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    setCancelling(true);
    try {
      await api.put(`/reservations/${id}`, {});
      toast.success('Réservation annulée.');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Impossible d\'annuler.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!ticket?.id) return;
    try {
      toast.loading('Génération du PDF...');
      const response = await api.get(`/tickets/${ticket.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `billet_${reservation.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Billet téléchargé !');
    } catch (err) {
      toast.dismiss();
      toast.error('Erreur lors du téléchargement du PDF.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!reservation) return null;

  const s = STATUS[reservation.status] || STATUS.expired;
  const film   = reservation.seance?.film || {};
  const seance = reservation.seance || {};
  const salle  = seance.salle || {};
  const seats  = reservation.seats || [];
  const isPending = reservation.status === 'pending';
  const isPaid    = reservation.status === 'paid';
  const expiresAt = reservation.expires_at ? new Date(reservation.expires_at) : null;
  const notExpired = expiresAt && expiresAt > new Date();

  // The verification URL the scanner would use
  const verifyUrl = `${window.location.protocol}//${window.location.hostname}:8000/api/tickets/${reservation.id}/verify`;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/reservations" style={{ color: 'var(--text-muted)', fontSize: 14, display: 'inline-flex', gap: 4, marginBottom: 28 }}>
          ← Mes réservations
        </Link>

        {/* Status banner */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 22px', borderRadius: 12, marginBottom: 24,
          background: isPaid ? 'var(--green-dim)' : isPending ? 'var(--gold-dim)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isPaid ? 'rgba(34,197,94,0.3)' : isPending ? 'rgba(245,166,35,0.3)' : 'var(--border)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{s.emoji}</span>
            <div>
              <span className={`badge ${s.cls}`}>{s.label}</span>
              {isPending && expiresAt && notExpired && (
                <p style={{ fontSize: 13, marginTop: 4, color: 'var(--text-muted)' }}>
                  Expire dans <Countdown expiresAt={expiresAt} />
                </p>
              )}
            </div>
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--gold-text)' }}>
            {reservation.total_price} MAD
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isPaid && ticket ? '1fr 1fr' : '1fr', gap: 24 }}>
          {/* Reservation info */}
          <div className="glass-card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 20, marginBottom: 18 }}>Détails de la réservation</h2>

            {[
              ['Film', film.title],
              ['Salle', salle.name],
              ['Type', seance.session_type === 'vip' ? '⭐ VIP' : '🎬 Normal'],
              ['Langue', seance.language],
              ['Date', seance.start_time ? format(new Date(seance.start_time), "eeee d MMMM yyyy • HH:mm", { locale: fr }) : null],
              ['Sièges', seats.map(s => `${s.row_letter}${s.seat_number}`).join(', ')],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14, gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 500, color: 'var(--text-heading)', textAlign: 'right' }}>{value}</span>
              </div>
            ))}

            {/* Actions */}
            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {isPending && notExpired && (
                <>
                  <button
                    onClick={handleSimulatePayment}
                    disabled={simulating}
                    className="btn btn-gold"
                    style={{ flex: 1 }}
                  >
                    {simulating ? '⏳ Traitement...' : '🎭 Simuler le paiement'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="btn btn-red"
                  >
                    {cancelling ? '...' : 'Annuler'}
                  </button>
                </>
              )}
              {isPaid && ticket?.id && (
                <button
                  onClick={handleDownloadPdf}
                  className="btn btn-green"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  📥 Télécharger le PDF
                </button>
              )}
            </div>
          </div>

          {/* Ticket with QR code */}
          {isPaid && (
            <div className="glass-card fade-in" style={{
              padding: '28px 24px', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(245,166,35,0.06), rgba(168,85,247,0.06))',
              border: '1px solid rgba(245,166,35,0.2)',
            }}>
              <p style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                CinéHall · Billet électronique
              </p>
              <h3 style={{ fontSize: 18, marginBottom: 4 }}>{film.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                {seance.start_time && format(new Date(seance.start_time), "d MMM yyyy • HH:mm", { locale: fr })}
              </p>

              {/* QR code using SVG component directly for maximum compatibility */}
              <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 12, marginBottom: 16 }}>
                <QRCodeSVG
                  value={verifyUrl}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#080b14"
                  level="H"
                />
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Sièges : <strong style={{ color: 'var(--text-heading)' }}>{seats.map(s => `${s.row_letter}${s.seat_number}`).join(' · ')}</strong>
              </p>

              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
                Réservation #{reservation.id} · {reservation.total_price} MAD
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

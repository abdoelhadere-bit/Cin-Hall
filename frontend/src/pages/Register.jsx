import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 6) { toast.error('Le mot de passe doit faire au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Compte créé ! Bienvenue sur CinéHall 🎬');
      navigate('/');
    } catch (err) {
      const errs = err.response?.data;
      if (typeof errs === 'object') {
        const first = Object.values(errs)?.[0]?.[0];
        toast.error(first || 'Erreur lors de l\'inscription.');
      } else {
        toast.error('Erreur lors de l\'inscription.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', bottom: '10%', right: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.07), transparent 60%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg,#a855f7,#f5a623)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(168,85,247,0.25)', fontSize: 24,
          }}>🎭</div>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Créer un compte</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Rejoignez CinéHall et réservez vos places</p>
        </div>

        <div className="glass-card" style={{ padding: '36px 36px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} id="register-form">
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                id="register-name"
                className="form-input"
                placeholder="Jean Dupont"
                value={name}
                onChange={e => setName(e.target.value)}
                required minLength={2}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input
                id="register-email"
                className="form-input"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Mot de passe</label>
              <input
                id="register-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••• (min. 6 caractères)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={6}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position: 'absolute', right: 14, top: 36, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
              }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                id="register-confirm"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                style={{ borderColor: confirm && confirm !== password ? 'var(--red)' : undefined }}
              />
              {confirm && confirm !== password && (
                <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading || (confirm && confirm !== password)}
              className="btn btn-gold btn-full btn-lg"
              style={{ marginTop: 8 }}
            >
              {loading ? 'Création du compte...' : 'Créer mon compte →'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--gold-text)', fontWeight: 600 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
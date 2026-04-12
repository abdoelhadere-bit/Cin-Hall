import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Connecté avec succès !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '30%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(245,166,35,0.06), transparent 60%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg,#f5a623,#e8850a)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 32px rgba(245,166,35,0.3)',
            fontSize: 24,
          }}>🎬</div>
          <h1 style={{ fontSize: 30, marginBottom: 6 }}>Bon retour !</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Connectez-vous à votre compte CinéHall</p>
        </div>

        <div className="glass-card" style={{ padding: '36px 36px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Mot de passe</label>
              <input
                id="login-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 14, top: 36,
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-gold btn-full btn-lg"
              style={{ marginTop: 8 }}
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--gold-text)', fontWeight: 600 }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

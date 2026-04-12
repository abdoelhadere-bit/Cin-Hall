import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FilmIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="3" />
    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
  </svg>
);

const TicketIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--gold-text)' : 'var(--text)',
    fontWeight: isActive ? '600' : '500',
    fontSize: '14px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: isActive ? 'var(--gold-dim)' : 'transparent',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '6px',
  });

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,11,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg,#f5a623,#e8850a)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FilmIcon />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--text-heading)' }}>
              Ciné<span style={{ color: 'var(--gold-text)' }}>Hall</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            <NavLink to="/films" style={linkStyle} end={false}>
              <FilmIcon /> Films
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/reservations" style={linkStyle}>
                <TicketIcon /> Mes réservations
              </NavLink>
            )}
          </div>

          {/* Auth area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 999, padding: '6px 14px',
                    color: 'var(--text-heading)', fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#f5a623,#a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'Profil'}
                  </span>
                </button>

                {userOpen && (
                  <div onClick={() => setUserOpen(false)} style={{
                    position: 'fixed', inset: 0, zIndex: 98,
                  }} />
                )}
                {userOpen && (
                  <div style={{
                    position: 'absolute', top: '110%', right: 0,
                    background: '#13162a', border: '1px solid var(--border)',
                    borderRadius: 14, padding: 8, minWidth: 180,
                    zIndex: 99, boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                  }}>
                    {[
                      ...(user?.is_admin ? [{ to: '/admin', label: '🌟 Panneau Admin' }] : []),
                      { to: '/profile', label: 'Mon profil' },
                      { to: '/reservations', label: 'Mes réservations' },
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} onClick={() => setUserOpen(false)} style={{
                        display: 'block', padding: '9px 14px',
                        color: 'var(--text)', fontSize: 14, borderRadius: 8,
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {label}
                      </Link>
                    ))}
                    <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                    <button onClick={handleLogout} style={{
                      width: '100%', textAlign: 'left', padding: '9px 14px',
                      color: 'var(--red)', fontSize: 14, background: 'none',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
                <Link to="/register" className="btn btn-gold btn-sm">S'inscrire</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(o => !o)}
              className="mobile-menu-btn"
              style={{
                background: 'none', border: 'none',
                color: 'var(--text)', padding: 6, display: 'none',
              }}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px 16px' }}>
            <NavLink to="/films" style={linkStyle} onClick={() => setOpen(false)}>Films</NavLink>
            {isAuthenticated && (
              <NavLink to="/reservations" style={linkStyle} onClick={() => setOpen(false)}>Mes réservations</NavLink>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const links = [
    { name: 'Tableau de bord', path: '/admin', icon: '📊' },
    { name: 'Films', path: '/admin/films', icon: '🎬' },
    { name: 'Salles & Sièges', path: '/admin/salles', icon: '🏢' },
    { name: 'Séances', path: '/admin/seances', icon: '📅' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 250, background: 'rgba(255, 255, 255, 0.03)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--gold), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff'
          }}>C</div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>CinéHall Admin</span>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {links.map(l => {
            const active = l.path === '/admin' ? pathname === '/admin' : pathname.startsWith(l.path);
            return (
              <Link key={l.path} to={l.path} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 8,
                background: active ? 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(168,85,247,0.1))' : 'transparent',
                color: active ? 'var(--gold-text)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 500,
                border: `1px solid ${active ? 'rgba(245,166,35,0.2)' : 'transparent'}`,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 18 }}>{l.icon}</span>
                {l.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 24, borderTop: '1px solid var(--border)' }}>
          <Link to="/" style={{ display: 'block', color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
            ← Retour au site
          </Link>
          <button onClick={logout} className="btn btn-red" style={{ width: '100%' }}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

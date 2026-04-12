import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '28px 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        <p>© {new Date().getFullYear()} <span style={{ color: 'var(--gold-text)', fontWeight: 600 }}>CinéHall</span> — Votre expérience cinéma réinventée.</p>
      </footer>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#13162a',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#13162a' } },
          error:   { iconTheme: { primary: '#e63946', secondary: '#13162a' } },
        }}
      />
    </div>
  );
}
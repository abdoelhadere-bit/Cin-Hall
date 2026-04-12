import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const isAdmin = user && (user.is_admin === 1 || user.is_admin === true);

  return isAuthenticated && isAdmin ? children : <Navigate to="/" replace />;
}

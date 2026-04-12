import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

import Home             from './pages/Home';
import Films            from './pages/Films';
import FilmDetail       from './pages/FilmDetail';
import SeanceDetail     from './pages/SeanceDetail';
import Reservations     from './pages/Reservations';
import ReservationDetail from './pages/ReservationDetail';
import Profile          from './pages/Profile';
import Login            from './pages/Login';
import Register         from './pages/Register';

// Admin imports
import Dashboard    from './pages/admin/Dashboard';
import AdminFilms   from './pages/admin/AdminFilms';
import AdminSalles  from './pages/admin/AdminSalles';
import AdminSieges  from './pages/admin/AdminSieges';
import AdminSeances from './pages/admin/AdminSeances';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes with AdminLayout */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/films" element={<AdminFilms />} />
                  <Route path="/salles" element={<AdminSalles />} />
                  <Route path="/salles/:id/sieges" element={<AdminSieges />} />
                  <Route path="/seances" element={<AdminSeances />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          } />

          {/* Public & User Protected Routes with Public Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                {/* Public */}
                <Route path="/"           element={<Home />}        />
                <Route path="/films"      element={<Films />}       />
                <Route path="/films/:id"  element={<FilmDetail />}  />
                <Route path="/seances/:id" element={<SeanceDetail />} />
                <Route path="/login"      element={<Login />}       />
                <Route path="/register"   element={<Register />}    />

                {/* Protected */}
                <Route path="/reservations" element={
                  <ProtectedRoute><Reservations /></ProtectedRoute>
                } />
                <Route path="/reservations/:id" element={
                  <ProtectedRoute><ReservationDetail /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(user?.name || '');
  const [email, setEmail]       = useState(user?.email || '');
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, email });
      toast.success('Profil mis à jour !');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Compte supprimé.');
      navigate('/');
    } catch {
      toast.error('Impossible de supprimer le compte.');
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Mon profil</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>Gérez vos informations personnelles</p>

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg,#f5a623,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: 40, fontWeight: 700, color: '#fff',
            boxShadow: '0 0 32px rgba(245,166,35,0.25)',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</p>
        </div>

        {/* Profile card */}
        <div className="glass-card" style={{ padding: '28px 28px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <h3 style={{ fontSize: 18 }}>Informations personnelles</h3>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">
                ✏️ Modifier
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Adresse email</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" disabled={saving} className="btn btn-gold" style={{ flex: 1 }}>
                  {saving ? 'Enregistrement...' : '💾 Enregistrer'}
                </button>
                <button type="button" onClick={() => { setEditing(false); setName(user?.name || ''); setEmail(user?.email || ''); }} className="btn btn-ghost">
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div>
              {[['Nom', user?.name], ['Email', user?.email]].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ color: 'var(--text-heading)', fontWeight: 500 }}>{val}</span>
                </div>
              ))}
              {user?.is_admin && (
                <div style={{ marginTop: 14 }}>
                  <span className="badge badge-purple">👑 Administrateur</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="glass-card" style={{ padding: '24px 28px', border: '1px solid rgba(230,57,70,0.2)' }}>
          <h3 style={{ fontSize: 18, color: 'var(--red)', marginBottom: 8 }}>⚠️ Zone dangereuse</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>
            La suppression de votre compte est irréversible. Toutes vos données seront perdues.
          </p>
          <button onClick={handleDelete} disabled={deleting} className="btn btn-red">
            {deleting ? 'Suppression...' : '🗑️ Supprimer mon compte'}
          </button>
        </div>
      </div>
    </div>
  );
}

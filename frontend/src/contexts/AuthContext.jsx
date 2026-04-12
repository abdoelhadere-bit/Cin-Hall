import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('token'));

  const applyToken = (t) => {
    localStorage.setItem('token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Restore user from stored token on app load
  const fetchMe = useCallback(async () => {
    if (!localStorage.getItem('token')) { setIsLoading(false); return; }
    try {
      const res = await api.post('/auth/me');
      setUser(res.data);
    } catch {
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    applyToken(res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    // register doesn't return a token — auto-login after
    await login(email, password);
    return res.data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
  };

  const updateProfile = async (data) => {
    const res = await api.put('/profile', data);
    setUser(res.data);
    return res.data;
  };

  const deleteAccount = async () => {
    await api.delete('/profile');
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAuthenticated: !!token,
      login, register, logout, updateProfile, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
export default AuthContext;
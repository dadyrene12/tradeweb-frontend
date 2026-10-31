import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

const hasSessionCookie = () =>
  typeof document !== 'undefined' && document.cookie.split('; ').some((item) => item.startsWith('glectron_session='));

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!hasSessionCookie()) {
      setUser(null);
      return null;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!hasSessionCookie()) {
        if (active) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (active) setUser(data.user);
      } catch (error) {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    const handleExpired = () => setUser(null);
    window.addEventListener('auth:session-expired', handleExpired);

    return () => {
      active = false;
      window.removeEventListener('auth:session-expired', handleExpired);
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

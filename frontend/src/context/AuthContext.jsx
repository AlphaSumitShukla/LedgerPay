import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [token, setToken] = useState(() => localStorage.getItem('ledger_auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ledger_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Synchronize state changes to localStorage
  const updateAuth = useCallback((newUser, newToken) => {
    if (newToken && newUser) {
      localStorage.setItem('ledger_auth_token', newToken);
      localStorage.setItem('ledger_auth_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } else {
      localStorage.removeItem('ledger_auth_token');
      localStorage.removeItem('ledger_auth_user');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Listen for unauthorized 401 events from the API client
  useEffect(() => {
    const handleUnauthorized = () => {
      updateAuth(null, null);
      toast.warning('Your session has expired. Please sign in again.');
    };

    window.addEventListener('ledger_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('ledger_unauthorized', handleUnauthorized);
    };
  }, [updateAuth, toast]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      updateAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data;
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await api.auth.register({ name, email, password });
      updateAuth(data.user, data.token);
      toast.success(`Account created successfully! Welcome, ${data.user.name}.`);
      return data;
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      updateAuth(null, null);
      setLoading(false);
      toast.info('You have been logged out.');
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

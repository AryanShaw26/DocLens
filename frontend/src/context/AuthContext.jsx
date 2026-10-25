import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(() => {
    return localStorage.getItem('doclens_disclaimer_accepted') === 'true';
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          api.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth_unauthorized', handleUnauthorized);

    initAuth();
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setUser(res.user);
    return res;
  };

  const register = async (email, password, fullName) => {
    const res = await api.register(email, password, fullName);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const acceptDisclaimer = () => {
    localStorage.setItem('doclens_disclaimer_accepted', 'true');
    setDisclaimerAccepted(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        disclaimerAccepted,
        login,
        register,
        logout,
        acceptDisclaimer,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


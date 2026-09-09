// frontend/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await getMe();
        if (res.status === 'success' && res.data) {
          setUser(res.data);
          sessionStorage.setItem('sikaca_user', JSON.stringify(res.data));
        } else {
          // Fallback ke sessionStorage jika respons tidak success
          const storedUser = sessionStorage.getItem('sikaca_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        // Jika request gagal total (401, network error), fallback
        const storedUser = sessionStorage.getItem('sikaca_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
        console.log('getMe gagal, fallback sessionStorage:', storedUser);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await apiLogin(username, password);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      sessionStorage.removeItem('sikaca_user');
      window.location.href = '/login';
    }
  }, []);

  const setUserManually = useCallback((userData) => {
    setUser(userData);
    sessionStorage.setItem('sikaca_user', JSON.stringify(userData));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.status === 'success' && res.data) {
        setUser(res.data);
        sessionStorage.setItem('sikaca_user', JSON.stringify(res.data));
        return res.data;
      }
    } catch (error) {
      console.error('Gagal refresh user', error);
    }
    return null;
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    setUserManually,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isKasir: user?.role === 'kasir',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
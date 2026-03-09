import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, removeToken, authFetch } from './auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authFetch('/usuario');
      if (!res.ok) throw new Error('No se pudo cargar el perfil');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (token) => {
    setToken(token);
    fetchUser();
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  // Actualiza datos del usuario (por ejemplo, avatar)
  const updateUser = async (fields) => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError('No autenticado');
      setLoading(false);
      return;
    }
    try {
      const res = await authFetch('/usuario', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(fields)
      });
      if (!res.ok) throw new Error('No se pudo actualizar el usuario');
      await fetchUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refetchUser: fetchUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

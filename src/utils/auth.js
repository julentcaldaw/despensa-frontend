// src/utils/auth.js

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

// ...existing code...
export const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  // Si la URL ya empieza por /, quita el primer slash para evitar doble barra
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const finalUrl = `${apiUrl}/${cleanUrl}`;
  const response = await fetch(finalUrl, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    removeToken();
    // Evita bucle de recarga si ya estamos en login
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  return response;
};

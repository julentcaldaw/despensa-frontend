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
  const finalUrl = `${apiUrl}${url}`;
  const response = await fetch(finalUrl, { ...options, headers });
  if (response.status === 401) {
    removeToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return response;
};

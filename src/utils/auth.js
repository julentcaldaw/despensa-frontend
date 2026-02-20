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

export const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';
  const finalUrl = `${apiUrl}${url}` 
  return fetch(finalUrl, { ...options, headers });
};

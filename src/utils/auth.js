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
  const apiUrl = process.env.REACT_APP_API_URL;
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const finalUrl = `${apiUrl}/${cleanUrl}`;
  console.log('[authFetch] URL:', finalUrl);
  console.log('[authFetch] Token:', token);
  console.log('[authFetch] Headers:', headers);
  const response = await fetch(finalUrl, { ...options, headers, credentials: 'include' });
  console.log('[authFetch] Response status:', response.status);
  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch {}
    console.log('[authFetch] Response error body:', errorText);
  }
  if (response.status === 401 || response.status === 403) {
    removeToken();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  return response;
};

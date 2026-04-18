// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('azamed_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rediriger vers login si token expiré
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('azamed_token');
      localStorage.removeItem('azamed_user');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export default api;

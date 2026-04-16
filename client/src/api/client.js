/**
 * Axios API Client
 * Attaches JWT token to all requests automatically.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request Interceptor: attach token ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response Interceptor: handle 401 ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('acc_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Axios API Client
 * Attaches JWT token to all requests automatically.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — Gemini AI can take 20-40 seconds on cold starts
});

// ── Request Interceptor: attach token + debug log ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`[API] --> ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  return config;
});

// ── Response Interceptor: handle 401 + debug log ─────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`[API] <-- ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API] <-- ERROR ${error.response?.status} ${error.config?.url}:`, error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('acc_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


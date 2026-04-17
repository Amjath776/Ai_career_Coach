/**
 * Axios API Client
 * Attaches JWT token to all requests automatically.
 * Uses VITE_API_URL env var in production, falls back to /api for local dev proxy.
 */

import axios from 'axios';

const isDev = import.meta.env.MODE === 'development';

const api = axios.create({
  // Use the env var if provided, otherwise default to /api
  // In development, this will use the Vite proxy defined in vite.config.js
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

//  Request Interceptor: attach token + debug log 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`[API] --> ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  return config;
});

//  Response Interceptor: handle 401 + debug log 
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
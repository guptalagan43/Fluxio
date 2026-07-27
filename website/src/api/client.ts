// src/api/client.ts
// Axios instance with base URL, credentials, and 401 interceptor.

import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000',
  withCredentials: true,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if on protected page
    if (error.response?.status === 401 && window.location.pathname.startsWith('/dashboard')) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    return Promise.reject(error);
  }
);

export default api;

// src/api/client.ts
// Axios instance with base URL, credentials, and 401 interceptor.
// Per architecture.md Section 6.3 — all API calls go through this instance.

import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = `/login?redirect=${window.location.pathname}`;
    }
    return Promise.reject(error);
  }
);

// src/api/auth.ts
// Auth API function stubs — real implementations in Phase 7.

import { api } from './client';
import type { AxiosResponse } from 'axios';

export const authApi = {
  requestOtp: (email: string): Promise<AxiosResponse> =>
    api.post('/auth/request-otp', { email }),

  verifyOtp: (email: string, otp: string): Promise<AxiosResponse> =>
    api.post('/auth/verify-otp', { email, otp }),

  logout: (): Promise<AxiosResponse> =>
    api.post('/auth/logout'),

  me: (): Promise<AxiosResponse> =>
    api.get('/auth/me'),
};

// src/api/auth.ts
// Authentication API client methods.

import apiClient from './client';
import type { AuthResponse, User } from '../types/api';

export async function requestOtp(email: string): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/auth/request-otp', { email });
  return res.data;
}

export async function verifyOtp(email: string, otp: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/verify-otp', { email, otp });
  return res.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getMe(): Promise<{ user: User }> {
  const res = await apiClient.get<{ user: User }>('/auth/me');
  return res.data;
}

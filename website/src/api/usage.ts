// src/api/usage.ts
// Usage and settings API client methods for dashboard.

import apiClient from './client';
import type { UsageData, UserSettings, SyncPayload, SyncResponse } from '../types/api';

export async function getUsage(range = '7d'): Promise<UsageData> {
  const res = await apiClient.get<UsageData>(`/api/usage?range=${range}`);
  return res.data;
}

export async function getSettings(): Promise<UserSettings> {
  const res = await apiClient.get<UserSettings>('/api/settings');
  return res.data;
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const res = await apiClient.put<UserSettings>('/api/settings', settings);
  return res.data;
}

export async function deleteData(): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>('/api/data');
  return res.data;
}

export async function syncEvents(payload: SyncPayload): Promise<SyncResponse> {
  const res = await apiClient.post<SyncResponse>('/api/sync', payload);
  return res.data;
}

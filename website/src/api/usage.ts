// src/api/usage.ts
// Usage API function stubs — real implementations in Phase 7.

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { Settings } from '../types/domain';

export type UsageRange = '7d' | '30d' | '90d';

export const usageApi = {
  getUsage: (range: UsageRange): Promise<AxiosResponse> =>
    api.get(`/api/usage?range=${range}`),

  getSettings: (): Promise<AxiosResponse> =>
    api.get('/api/settings'),

  saveSettings: (data: Partial<Settings>): Promise<AxiosResponse> =>
    api.put('/api/settings', data),

  deleteData: (): Promise<AxiosResponse> =>
    api.delete('/api/data'),
};

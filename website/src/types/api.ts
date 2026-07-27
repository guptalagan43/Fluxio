// src/types/api.ts
// API response types matching backend DTOs.

import type {
  UsageSummary,
  DailyUsage,
  PlatformUsage,
  ModelUsage,
  SessionSummary,
  Settings,
  User,
} from './domain';

export interface UsageResponse {
  summary: UsageSummary;
  daily: DailyUsage[];
  byPlatform: PlatformUsage[];
  byModel: ModelUsage[];
  recentSessions: SessionSummary[];
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface OtpRequestResponse {
  message: string;
}

export interface SettingsResponse {
  message: string;
  settings: Settings;
}

export interface SyncResponse {
  synced: number;
  duplicatesSkipped: number;
}

export interface DeleteDataResponse {
  message: string;
  eventsDeleted: number;
}

export interface ErrorResponse {
  error: string;
  retryAfter?: number;
}

// src/types/api.ts
// API response types matching backend DTOs.

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserSettings {
  userId: string;
  weeklyLimitUsd: number;
  syncEnabled: boolean;
  notify50: boolean;
  notify80: boolean;
  notify100: boolean;
  preferredQuick: string;
  preferredCode: string;
  preferredLong: string;
  preferredCreative: string;
}

export interface UsageData {
  range: string;
  summaryCards: {
    totalTokens: number;
    totalCostUsd: number;
    topPlatform: string;
    topModel: string;
  };
  daily: Array<{ date: string; tokens: number; costUsd: number }>;
  byPlatform: Array<{ platform: string; tokens: number; costUsd: number }>;
  byModel: Array<{ model: string; platform: string; tokens: number; costUsd: number; sessionCount: number }>;
  recentSessions: Array<{
    sessionId: string;
    platform: string;
    model: string | null;
    tokens: number;
    costUsd: number;
    occurredAt: string;
  }>;
}

export interface SyncPayload {
  events: Array<{
    sessionId: string;
    platform: string;
    model?: string | null;
    role: 'user' | 'assistant';
    estimatedTokens: number;
    estimatedCostUSD: number;
    occurredAt: string;
  }>;
}

export interface SyncResponse {
  synced: number;
}

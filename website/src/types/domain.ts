// src/types/domain.ts
// Domain types used across the website.

export interface User {
  id: string;
  email: string;
}

export interface Settings {
  weeklyLimitUsd: string;
  syncEnabled: boolean;
  notify50: boolean;
  notify80: boolean;
  notify100: boolean;
  preferredQuick: string;
  preferredCode: string;
  preferredLong: string;
  preferredCreative: string;
}

export interface UsageEvent {
  id: string;
  sessionId: string;
  platform: string;
  model: string | null;
  role: 'user' | 'assistant';
  estimatedTokens: number;
  estimatedCostUsd: string;
  occurredAt: string;
}

export interface SessionSummary {
  sessionId: string;
  platform: string;
  model: string;
  startTime: string;
  durationMinutes: number;
  tokens: number;
  costUSD: string;
}

export interface PlatformUsage {
  platform: string;
  tokens: number;
  costUSD: string;
  share: number;
}

export interface ModelUsage {
  model: string;
  platform: string;
  tokens: number;
  costUSD: string;
  sessions: number;
}

export interface DailyUsage {
  date: string;
  tokens: number;
  costUSD: string;
}

export interface UsageSummary {
  totalTokens: number;
  totalCostUSD: string;
  topPlatform: string;
  topModel: string;
}

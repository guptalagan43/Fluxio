// src/utils/types.ts
// All TypeScript interfaces for the AI Token Tracker extension.

export interface Turn {
  role: 'user' | 'assistant' | 'aggregate';
  tokens: number;
  cost: number;
  ts: number;
}

export interface Session {
  sessionId: string;
  tabId: number;
  platform: string;
  model: string;
  startTime: number;
  lastActive: number;
  turns: Turn[];
  totalTokens: number;
  totalCostUSD: number;
  warned6k: boolean;
  warned15k: boolean;
  lastSuggestion: SuggestionResult | null;
}

export interface Budget {
  weeklyLimitUSD: number;
  weekStartDate: string;
  currentWeekUSD: number;
  notified50: boolean;
  notified80: boolean;
  notified100: boolean;
  notificationsEnabled: boolean;
}

export interface DayRollup {
  totalTokens: number;
  totalCostUSD: number;
  byPlatform: Record<string, { tokens: number; costUSD: number }>;
}

export interface Prefs {
  syncEnabled: boolean;
  lastSyncAt: number;
  pendingSyncEvents: SyncEvent[];
  syncFailCount: number;
  preferredModels: {
    quickQA: string;
    code: string;
    longContext: string;
    creative: string;
  };
  disabledPlatforms: string[];
}

export interface SyncEvent {
  sessionId: string;
  platform: string;
  model: string | null;
  role: 'user' | 'assistant';
  estimatedTokens: number;
  estimatedCostUSD: number;
  occurredAt: string;
}

export interface CostConfig {
  lastFetched: number;
  models: Record<string, { inputPer1k: number; outputPer1k: number }>;
}

export interface SuggestionResult {
  category: 'quickQA' | 'code' | 'longContext' | 'creative' | 'research';
  tier: string;
  recommendedModel: string;
  hint: string;
  budgetWarning: boolean;
}

export interface PlatformConfig {
  id: string;
  name: string;
  matchUrls: string[];
  selectors: {
    messageContainer: string;
    userMessage: string;
    assistantMessage: string;
    modelLabel: string;
  };
  tokenizerEncoding: string;
}

export interface NewMessagePayload {
  platform: string;
  model: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  tabId: number;
}

export type ExtensionMessage =
  | { type: 'NEW_MESSAGE'; payload: NewMessagePayload }
  | { type: 'GET_SESSION'; tabId: number }
  | { type: 'GET_SUMMARY' }
  | { type: 'AUTH_SUCCESS'; token: string }
  | { type: 'DISMISS_SUGGESTION'; sessionId: string }
  | { type: 'DISMISS_WARNING'; sessionId: string };

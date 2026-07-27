// src/utils/storage.ts
// Typed wrappers for chrome.storage.local — the single gateway for all storage operations.
// Per rules.md Rule 3.1: never call chrome.storage.local directly outside this file.

import type { Session, Budget, DayRollup, Prefs, CostConfig } from './types';
import { DEFAULT_WEEKLY_BUDGET_USD } from './constants';
import { getWeekStart } from './time';

// ── Session helpers ───────────────────────────────────────────────────

export async function getSession(tabId: number): Promise<Session | null> {
  const key = `session:${tabId}`;
  const result = await chrome.storage.local.get(key);
  const session = result[key] as Session | undefined;
  return session ?? null;
}

export async function setSession(tabId: number, session: Session): Promise<void> {
  const key = `session:${tabId}`;
  await chrome.storage.local.set({ [key]: session });
}

export async function removeSession(tabId: number): Promise<void> {
  const key = `session:${tabId}`;
  await chrome.storage.local.remove(key);
}

export async function saveCompletedSession(session: Session): Promise<void> {
  const key = `session:${session.sessionId}`;
  await chrome.storage.local.set({ [key]: session });
}

// ── Budget helpers ────────────────────────────────────────────────────

const DEFAULT_BUDGET: Budget = {
  weeklyLimitUSD: DEFAULT_WEEKLY_BUDGET_USD,
  weekStartDate: getWeekStart().toISOString().slice(0, 10),
  currentWeekUSD: 0,
  notified50: false,
  notified80: false,
  notified100: false,
  notificationsEnabled: true,
};

export async function getBudget(): Promise<Budget> {
  const result = await chrome.storage.local.get('budget');
  const budget = result.budget as Budget | undefined;
  return budget ?? { ...DEFAULT_BUDGET };
}

export async function setBudget(budget: Budget): Promise<void> {
  await chrome.storage.local.set({ budget });
}

// ── Daily rollup helpers ──────────────────────────────────────────────

export async function getDayRollup(dateKey: string): Promise<DayRollup> {
  const key = `day:${dateKey}`;
  const result = await chrome.storage.local.get(key);
  const rollup = result[key] as DayRollup | undefined;
  return rollup ?? { totalTokens: 0, totalCostUSD: 0, byPlatform: {} };
}

export async function setDayRollup(dateKey: string, rollup: DayRollup): Promise<void> {
  const key = `day:${dateKey}`;
  await chrome.storage.local.set({ [key]: rollup });
}

// ── Preferences helpers ───────────────────────────────────────────────

const DEFAULT_PREFS: Prefs = {
  syncEnabled: false,
  lastSyncAt: 0,
  pendingSyncEvents: [],
  syncFailCount: 0,
  preferredModels: {
    quickQA: 'gpt-4o-mini',
    code: 'claude-sonnet',
    longContext: 'gemini-1.5-pro',
    creative: 'claude-sonnet',
    research: 'gpt-4o',
  },
  disabledPlatforms: [],
};

export async function getPrefs(): Promise<Prefs> {
  const result = await chrome.storage.local.get('prefs');
  const prefs = result.prefs as Prefs | undefined;
  return prefs ?? { ...DEFAULT_PREFS };
}

export async function setPrefs(prefs: Prefs): Promise<void> {
  await chrome.storage.local.set({ prefs });
}

// ── JWT helpers ───────────────────────────────────────────────────────

export async function getJwt(): Promise<string | null> {
  const result = await chrome.storage.local.get('jwt');
  const jwt = result.jwt as string | undefined;
  return jwt ?? null;
}

export async function setJwt(jwt: string | null): Promise<void> {
  if (jwt === null) {
    await chrome.storage.local.remove('jwt');
  } else {
    await chrome.storage.local.set({ jwt });
  }
}

// ── Cost config helpers ───────────────────────────────────────────────

export async function getCostConfig(): Promise<CostConfig | null> {
  const result = await chrome.storage.local.get('costConfig');
  const config = result.costConfig as CostConfig | undefined;
  return config ?? null;
}

export async function setCostConfig(config: CostConfig): Promise<void> {
  await chrome.storage.local.set({ costConfig: config });
}

// src/background/sessionManager.ts
// Manages session state, turns, daily rollups, weekly budget accumulation,
// badge updates, and session cleanup.

import type { NewMessagePayload, Session, Turn } from '../utils/types';
import { MAX_TURNS_PER_SESSION, SESSION_IDLE_TIMEOUT_MS, TURNS_TO_AGGREGATE } from '../utils/constants';
import { getSession, setSession, removeSession, saveCompletedSession, getDayRollup, setDayRollup, getBudget, setBudget } from '../utils/storage';
import { getTodayKey, isNewWeek, getWeekStart } from '../utils/time';
import { estimateTokens } from './tokenizer';
import { fetchAndCacheCostConfig, calculateCost } from './costConfigFetcher';

export async function getActiveSession(tabId: number): Promise<Session | null> {
  return await getSession(tabId);
}

export async function handleNewMessage(payload: NewMessagePayload, tabId: number): Promise<Session> {
  let session = await getSession(tabId);
  const now = Date.now();

  const tokens = estimateTokens(payload.text);
  const costConfig = await fetchAndCacheCostConfig();
  const costUSD = calculateCost(tokens, payload.model, payload.role, costConfig);

  const turn: Turn = {
    role: payload.role,
    tokens,
    cost: costUSD,
    ts: payload.timestamp || now,
  };

  if (!session || (now - session.lastActive > SESSION_IDLE_TIMEOUT_MS)) {
    if (session) {
      await saveCompletedSession(session);
    }

    session = {
      sessionId: crypto.randomUUID(),
      tabId,
      platform: payload.platform,
      model: payload.model,
      startTime: now,
      lastActive: now,
      turns: [turn],
      totalTokens: tokens,
      totalCostUSD: costUSD,
      warned6k: false,
      warned15k: false,
      lastSuggestion: null,
    };
  } else {
    session.lastActive = now;
    session.platform = payload.platform;
    session.model = payload.model;
    session.turns.push(turn);
    session.totalTokens += tokens;
    session.totalCostUSD += costUSD;

    // Turn aggregation if > MAX_TURNS_PER_SESSION
    if (session.turns.length > MAX_TURNS_PER_SESSION) {
      const oldestTurns = session.turns.splice(0, TURNS_TO_AGGREGATE);
      const aggTokens = oldestTurns.reduce((sum, t) => sum + t.tokens, 0);
      const aggCost = oldestTurns.reduce((sum, t) => sum + t.cost, 0);
      const aggTurn: Turn = {
        role: 'aggregate',
        tokens: aggTokens,
        cost: aggCost,
        ts: oldestTurns[0]?.ts || now,
      };
      session.turns.unshift(aggTurn);
    }
  }

  await setSession(tabId, session);
  await updateDailyRollup(payload.platform, tokens, costUSD);
  await updateWeeklyBudget(costUSD);
  await updateBadge();

  return session;
}

// ── Weekly Budget Accumulation ────────────────────────────────────────
// Called on every handleNewMessage to track weekly spending.

export async function updateWeeklyBudget(costUSD: number): Promise<void> {
  const budget = await getBudget();

  // Reset budget if a new week has started
  if (isNewWeek(budget.weekStartDate)) {
    budget.currentWeekUSD = 0;
    budget.weekStartDate = getWeekStart().toISOString().slice(0, 10);
    budget.notified50 = false;
    budget.notified80 = false;
    budget.notified100 = false;
  }

  budget.currentWeekUSD += costUSD;
  await setBudget(budget);
}

// ── Daily Rollup ──────────────────────────────────────────────────────

export async function updateDailyRollup(platform: string, tokens: number, costUSD: number): Promise<void> {
  const dateKey = getTodayKey();
  const rollup = await getDayRollup(dateKey);

  rollup.totalTokens += tokens;
  rollup.totalCostUSD += costUSD;

  if (!rollup.byPlatform[platform]) {
    rollup.byPlatform[platform] = { tokens: 0, costUSD: 0 };
  }

  const plat = rollup.byPlatform[platform]!;
  plat.tokens += tokens;
  plat.costUSD += costUSD;

  await setDayRollup(dateKey, rollup);
}

// ── Extension Badge ───────────────────────────────────────────────────
// Updates the icon badge text with today's token count (e.g. "14k").

async function updateBadge(): Promise<void> {
  const dateKey = getTodayKey();
  const rollup = await getDayRollup(dateKey);
  const badgeText = formatBadge(rollup.totalTokens);

  await chrome.action.setBadgeText({ text: badgeText });
  // Using the accent color from design.md
  await chrome.action.setBadgeBackgroundColor({ color: '#5c4a3a' });
}

function formatBadge(tokens: number): string {
  if (tokens === 0) return '';
  if (tokens < 1000) return String(tokens);
  if (tokens < 10000) return `${(tokens / 1000).toFixed(1)}k`;
  if (tokens < 1000000) return `${Math.round(tokens / 1000)}k`;
  return `${(tokens / 1000000).toFixed(1)}M`;
}

// ── Session Cleanup ───────────────────────────────────────────────────

export async function cleanupInactiveSessions(): Promise<void> {
  const allStorage = await chrome.storage.local.get(null);
  const now = Date.now();

  for (const key of Object.keys(allStorage)) {
    if (key.startsWith('session:')) {
      const tabIdStr = key.replace('session:', '');
      const tabId = parseInt(tabIdStr, 10);
      if (!isNaN(tabId)) {
        const session = allStorage[key] as Session;
        if (now - session.lastActive > SESSION_IDLE_TIMEOUT_MS) {
          await saveCompletedSession(session);
          await removeSession(tabId);
        }
      }
    }
  }
}

export function registerTabListeners(): void {
  chrome.tabs.onRemoved.addListener(async (tabId) => {
    const session = await getSession(tabId);
    if (session) {
      await saveCompletedSession(session);
      await removeSession(tabId);
    }
  });
}

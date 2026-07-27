// src/services/usageService.ts
// Aggregates usage events for dashboard charts, tables, and summary cards.

import { prisma } from '../config/prisma.js';

export interface UsageSummary {
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

export async function getUsageForUser(userId: string, rangeDays = 7): Promise<UsageSummary> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - rangeDays);

  const events = await prisma.usageEvent.findMany({
    where: {
      userId,
      occurredAt: { gte: startDate },
    },
    orderBy: { occurredAt: 'desc' },
  });

  let totalTokens = 0;
  let totalCostUsd = 0;

  const dailyMap: Record<string, { tokens: number; costUsd: number }> = {};
  const platformMap: Record<string, { tokens: number; costUsd: number }> = {};
  const modelMap: Record<string, { platform: string; tokens: number; costUsd: number; sessions: Set<string> }> = {};
  const sessionMap: Record<string, { sessionId: string; platform: string; model: string | null; tokens: number; costUsd: number; occurredAt: string }> = {};

  for (const event of events) {
    const cost = Number(event.estimatedCostUsd);
    totalTokens += event.estimatedTokens;
    totalCostUsd += cost;

    // Daily rollup
    const dateStr = event.occurredAt.toISOString().slice(0, 10);
    if (!dailyMap[dateStr]) dailyMap[dateStr] = { tokens: 0, costUsd: 0 };
    dailyMap[dateStr]!.tokens += event.estimatedTokens;
    dailyMap[dateStr]!.costUsd += cost;

    // Platform rollup
    const plat = event.platform;
    if (!platformMap[plat]) platformMap[plat] = { tokens: 0, costUsd: 0 };
    platformMap[plat]!.tokens += event.estimatedTokens;
    platformMap[plat]!.costUsd += cost;

    // Model rollup
    const model = event.model || 'Unknown';
    if (!modelMap[model]) modelMap[model] = { platform: plat, tokens: 0, costUsd: 0, sessions: new Set() };
    modelMap[model]!.tokens += event.estimatedTokens;
    modelMap[model]!.costUsd += cost;
    modelMap[model]!.sessions.add(event.sessionId);

    // Session rollup
    if (!sessionMap[event.sessionId]) {
      sessionMap[event.sessionId] = {
        sessionId: event.sessionId,
        platform: plat,
        model: event.model,
        tokens: 0,
        costUsd: 0,
        occurredAt: event.occurredAt.toISOString(),
      };
    }
    sessionMap[event.sessionId]!.tokens += event.estimatedTokens;
    sessionMap[event.sessionId]!.costUsd += cost;
  }

  // Top platform & top model
  let topPlatform = 'None';
  let maxPlatTokens = 0;
  for (const [p, data] of Object.entries(platformMap)) {
    if (data.tokens > maxPlatTokens) {
      maxPlatTokens = data.tokens;
      topPlatform = p;
    }
  }

  let topModel = 'None';
  let maxModelTokens = 0;
  for (const [m, data] of Object.entries(modelMap)) {
    if (data.tokens > maxModelTokens) {
      maxModelTokens = data.tokens;
      topModel = m;
    }
  }

  // Format arrays
  const daily = Object.entries(dailyMap)
    .map(([date, d]) => ({ date, tokens: d.tokens, costUsd: Number(d.costUsd.toFixed(4)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byPlatform = Object.entries(platformMap)
    .map(([platform, d]) => ({ platform, tokens: d.tokens, costUsd: Number(d.costUsd.toFixed(4)) }))
    .sort((a, b) => b.tokens - a.tokens);

  const byModel = Object.entries(modelMap)
    .map(([model, d]) => ({
      model,
      platform: d.platform,
      tokens: d.tokens,
      costUsd: Number(d.costUsd.toFixed(4)),
      sessionCount: d.sessions.size,
    }))
    .sort((a, b) => b.tokens - a.tokens);

  const recentSessions = Object.values(sessionMap)
    .map((s) => ({ ...s, costUsd: Number(s.costUsd.toFixed(4)) }))
    .slice(0, 20);

  return {
    range: `${rangeDays}d`,
    summaryCards: {
      totalTokens,
      totalCostUsd: Number(totalCostUsd.toFixed(4)),
      topPlatform,
      topModel,
    },
    daily,
    byPlatform,
    byModel,
    recentSessions,
  };
}

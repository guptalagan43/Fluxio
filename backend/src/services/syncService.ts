// src/services/syncService.ts
// Batch upsert service for synchronizing extension usage events to PostgreSQL database.

import { prisma } from '../config/prisma.js';
import type { SyncInput } from '../schemas/api.schemas.js';

export async function batchUpsertEvents(userId: string, input: SyncInput) {
  if (!input.events || input.events.length === 0) {
    return { synced: 0, duplicatesSkipped: 0 };
  }

  const dataToInsert = input.events.map((event) => ({
    userId,
    sessionId: event.sessionId,
    platform: event.platform,
    model: event.model || null,
    role: event.role,
    estimatedTokens: event.estimatedTokens,
    estimatedCostUsd: event.estimatedCostUSD,
    occurredAt: new Date(event.occurredAt),
  }));

  const result = await prisma.usageEvent.createMany({
    data: dataToInsert,
    skipDuplicates: true, // @@unique([userId, sessionId, occurredAt])
  });

  return {
    synced: result.count,
    duplicatesSkipped: input.events.length - result.count,
  };
}

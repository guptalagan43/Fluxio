// src/schemas/api.schemas.ts
// Zod schemas for API data sync and user settings endpoints per PRD Section 10.3.

import { z } from 'zod';

export const syncEventSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  platform: z.string().max(50),
  model: z.string().max(100).nullable().optional(),
  role: z.enum(['user', 'assistant']),
  estimatedTokens: z.number().int().positive().max(200000),
  estimatedCostUSD: z.number().nonnegative().max(100),
  occurredAt: z.string(),
});

export const syncSchema = z.object({
  events: z.array(syncEventSchema).max(500, 'Maximum 500 events per batch'),
});

export const updateSettingsSchema = z.object({
  weeklyLimitUsd: z.number().positive().optional(),
  syncEnabled: z.boolean().optional(),
  notify50: z.boolean().optional(),
  notify80: z.boolean().optional(),
  notify100: z.boolean().optional(),
  preferredQuick: z.string().max(50).optional(),
  preferredCode: z.string().max(50).optional(),
  preferredLong: z.string().max(50).optional(),
  preferredCreative: z.string().max(50).optional(),
});

export type SyncInput = z.infer<typeof syncSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

// src/background/syncManager.ts
// Synchronizes extension token usage events to backend /api/sync per architecture.md Section 4.3.

import { getPrefs, setPrefs } from '../utils/storage';
import type { Prefs, SyncEvent, Session } from '../utils/types';

const API_SYNC_URL = (import.meta.env.VITE_API_URL as string || 'http://localhost:3000') + '/api/sync';

export async function checkAndSync(): Promise<void> {
  const result = await chrome.storage.local.get(['jwt', 'prefs']);
  const jwt = result.jwt as string | undefined;
  const prefs = (result.prefs as Prefs | undefined) || {
    syncEnabled: false,
    lastSyncAt: 0,
    pendingSyncEvents: [],
    syncFailCount: 0,
    preferredModels: { quickQA: 'gpt-4o-mini', code: 'claude-sonnet', longContext: 'gemini-1.5-pro', creative: 'claude-sonnet', research: 'gpt-4o' },
    disabledPlatforms: [],
  };

  if (!prefs.syncEnabled || !jwt) {
    return;
  }

  // Gather new events from storage sessions
  const allStorage = await chrome.storage.local.get(null);
  const newEvents: SyncEvent[] = [];

  for (const key of Object.keys(allStorage)) {
    if (key.startsWith('completed_session:') || key.startsWith('session:')) {
      const session = allStorage[key] as Session;
      if (session && session.turns) {
        for (const turn of session.turns) {
          if (turn.role !== 'aggregate' && turn.ts > prefs.lastSyncAt) {
            newEvents.push({
              sessionId: session.sessionId,
              platform: session.platform,
              model: session.model || null,
              role: turn.role,
              estimatedTokens: turn.tokens,
              estimatedCostUSD: turn.cost,
              occurredAt: new Date(turn.ts).toISOString(),
            });
          }
        }
      }
    }
  }

  const allPendingEvents = [...prefs.pendingSyncEvents, ...newEvents];

  if (allPendingEvents.length === 0) {
    return;
  }

  // Cap batch size at 500 events
  const batch = allPendingEvents.slice(0, 500);
  const remaining = allPendingEvents.slice(500);

  try {
    const response = await fetch(API_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ events: batch }),
    });

    if (!response.ok) {
      throw new Error(`Sync HTTP status ${response.status}`);
    }

    // Success
    const updatedPrefs: Prefs = {
      ...prefs,
      lastSyncAt: Date.now(),
      pendingSyncEvents: remaining,
      syncFailCount: 0,
    };
    await setPrefs(updatedPrefs);
    console.info(`[SYNC SUCCESS] Synced ${batch.length} events to backend.`);
  } catch (err) {
    console.warn('[SYNC ERROR] Failed to sync events to backend:', err);
    const updatedPrefs: Prefs = {
      ...prefs,
      pendingSyncEvents: allPendingEvents,
      syncFailCount: prefs.syncFailCount + 1,
    };
    await setPrefs(updatedPrefs);
  }
}

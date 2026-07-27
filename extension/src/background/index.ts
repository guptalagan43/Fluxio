// src/background/index.ts
// Background service worker entry point.
// Registers alarms, message router, and onInstalled handler.
// Per rules.md Rule 3.4: no DOM access in this file.

import type { ExtensionMessage } from '../utils/types';
import {
  ALARM_BUDGET_CHECK,
  ALARM_SYNC,
  ALARM_COST_CONFIG,
  ALARM_SESSION_CLEANUP,
  ALARM_BUDGET_CHECK_INTERVAL,
  ALARM_SYNC_INTERVAL,
  ALARM_COST_CONFIG_INTERVAL,
  ALARM_SESSION_CLEANUP_INTERVAL,
} from '../utils/constants';

// ── Message Router ────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    switch (message.type) {
      case 'NEW_MESSAGE':
        // Stub — implemented in Phase 2
        sendResponse({ received: true });
        break;

      case 'GET_SESSION':
        // Stub — implemented in Phase 2
        sendResponse(null);
        break;

      case 'GET_SUMMARY':
        // Stub — implemented in Phase 3
        sendResponse(null);
        break;

      case 'AUTH_SUCCESS':
        // Stub — implemented in Phase 6
        sendResponse({ received: true });
        break;

      case 'DISMISS_SUGGESTION':
        // Stub — implemented in Phase 5
        sendResponse({ received: true });
        break;

      case 'DISMISS_WARNING':
        // Stub — implemented in Phase 4
        sendResponse({ received: true });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }

    // Return true to indicate we will call sendResponse asynchronously
    return true;
  }
);

// ── Alarm Router ──────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case ALARM_BUDGET_CHECK:
      // Stub — implemented in Phase 4 (budgetManager.checkThresholds)
      break;

    case ALARM_SYNC:
      // Stub — implemented in Phase 8 (syncManager.checkAndSync)
      break;

    case ALARM_COST_CONFIG:
      // Stub — implemented in Phase 2 (costConfigFetcher.fetchAndCache)
      break;

    case ALARM_SESSION_CLEANUP:
      // Stub — implemented in Phase 2 (sessionManager.cleanupInactiveSessions)
      break;
  }
});

// ── onInstalled — create alarms + open onboarding ─────────────────────
// Per rules.md Rule 3.6: alarms are created only in onInstalled, never at top level.

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    chrome.alarms.clearAll(() => {
      chrome.alarms.create(ALARM_BUDGET_CHECK, {
        periodInMinutes: ALARM_BUDGET_CHECK_INTERVAL,
      });
      chrome.alarms.create(ALARM_SYNC, {
        periodInMinutes: ALARM_SYNC_INTERVAL,
      });
      chrome.alarms.create(ALARM_COST_CONFIG, {
        periodInMinutes: ALARM_COST_CONFIG_INTERVAL,
      });
      chrome.alarms.create(ALARM_SESSION_CLEANUP, {
        periodInMinutes: ALARM_SESSION_CLEANUP_INTERVAL,
      });
    });
  }

  // Open onboarding only on first install, not on update
  if (reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding/index.html'),
    });
  }
});

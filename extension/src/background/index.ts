// src/background/index.ts
// Background service worker entry point.
// Registers alarms, message router, tab listeners, and onInstalled handler.

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
import { handleNewMessage, getActiveSession, cleanupInactiveSessions, registerTabListeners } from './sessionManager';
import { fetchAndCacheCostConfig } from './costConfigFetcher';

// Register tab removal listeners
registerTabListeners();

// ── Message Router ────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    switch (message.type) {
      case 'NEW_MESSAGE': {
        const tabId = sender.tab?.id || 0;
        handleNewMessage(message.payload, tabId).then((session) => {
          sendResponse({ success: true, session });
        });
        return true;
      }

      case 'GET_SESSION': {
        const tabId = message.tabId || sender.tab?.id || 0;
        getActiveSession(tabId).then((session) => {
          sendResponse(session);
        });
        return true;
      }

      case 'GET_SUMMARY': {
        sendResponse(null);
        break;
      }

      case 'AUTH_SUCCESS': {
        sendResponse({ received: true });
        break;
      }

      case 'DISMISS_SUGGESTION': {
        sendResponse({ received: true });
        break;
      }

      case 'DISMISS_WARNING': {
        sendResponse({ received: true });
        break;
      }

      default:
        sendResponse({ error: 'Unknown message type' });
    }

    return true;
  }
);

// ── Alarm Router ──────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case ALARM_BUDGET_CHECK:
      // Implemented in Phase 4
      break;

    case ALARM_SYNC:
      // Implemented in Phase 8
      break;

    case ALARM_COST_CONFIG:
      fetchAndCacheCostConfig();
      break;

    case ALARM_SESSION_CLEANUP:
      cleanupInactiveSessions();
      break;
  }
});

// ── onInstalled — create alarms + open onboarding ─────────────────────

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

    // Initial fetch of cost config
    fetchAndCacheCostConfig();
  }

  if (reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding/index.html'),
    });
  }
});

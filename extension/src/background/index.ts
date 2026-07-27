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
import { checkThresholds } from './budgetManager';
import { checkAndSync } from './syncManager';
import { getSession, setSession, getPrefs, setPrefs } from '../utils/storage';

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
        const token = message.token;
        if (token) {
          chrome.storage.local.set({ jwt: token }).then(async () => {
            const prefs = await getPrefs();
            prefs.syncEnabled = true;
            await setPrefs(prefs);

            if (sender.tab?.id) {
              chrome.tabs.remove(sender.tab.id);
            }
          });
        }
        sendResponse({ success: true });
        return true;
      }

      case 'DISMISS_SUGGESTION': {
        const tabId = message.tabId || sender.tab?.id || 0;
        getSession(tabId).then(async (session) => {
          if (session) {
            session.lastSuggestion = null;
            await setSession(tabId, session);
          }
          sendResponse({ received: true });
        });
        return true;
      }

      case 'DISMISS_WARNING': {
        // Dismiss is handled in popup local state — no storage write needed
        // This message type is reserved for future use if needed
        sendResponse({ received: true });
        break;
      }

      case 'SAVE_PREFS': {
        // Will be used by SettingsPanel to persist prefs changes
        sendResponse({ received: true });
        break;
      }

      case 'SAVE_BUDGET': {
        // Will be used by SettingsPanel to persist budget changes
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
      checkThresholds();
      break;

    case ALARM_SYNC:
      checkAndSync();
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

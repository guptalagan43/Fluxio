// src/utils/constants.ts
// Fixed configuration values for the AI Token Tracker extension.

// We cap turns at 500 to stay within chrome.storage.local's 5MB quota.
// Beyond 500, older turns are aggregated into a single summary entry.
export const MAX_TURNS_PER_SESSION = 500;

// A session ends when the tab is idle for 30 minutes.
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

// Budget notification thresholds — each fires once per budget period.
export const BUDGET_THRESHOLDS = [0.5, 0.8, 1.0] as const;

// Context-length warning thresholds (in tokens).
export const WARNING_THRESHOLD_6K = 6000;
export const WARNING_THRESHOLD_15K = 15000;
export const WARNING_THRESHOLDS = [WARNING_THRESHOLD_6K, WARNING_THRESHOLD_15K] as const;

// Default weekly budget in USD.
export const DEFAULT_WEEKLY_BUDGET_USD = 5.0;

// Alarm names — used in chrome.alarms API.
export const ALARM_BUDGET_CHECK = 'budget-check';
export const ALARM_SYNC = 'sync';
export const ALARM_COST_CONFIG = 'cost-config';
export const ALARM_SESSION_CLEANUP = 'session-cleanup';

// Alarm intervals in minutes.
export const ALARM_BUDGET_CHECK_INTERVAL = 5;
export const ALARM_SYNC_INTERVAL = 10;
export const ALARM_COST_CONFIG_INTERVAL = 1440; // daily
export const ALARM_SESSION_CLEANUP_INTERVAL = 60; // hourly

// Number of turns to aggregate when MAX_TURNS is exceeded.
export const TURNS_TO_AGGREGATE = 100;

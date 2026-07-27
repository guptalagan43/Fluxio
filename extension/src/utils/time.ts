// src/utils/time.ts
// Time utility functions for budget resets and session duration formatting.

/**
 * Returns the most recent Monday at 00:00:00 local time.
 * Used for weekly budget reset detection.
 */
export function getWeekStart(now: Date = new Date()): Date {
  const date = new Date(now);
  const day = date.getDay();
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want Monday as the start of the week.
  const diffToMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns true if the stored weekStartDate is before the current week's Monday.
 * Signals that the budget should be reset.
 */
export function isNewWeek(weekStartDate: string): boolean {
  const stored = new Date(weekStartDate);
  const currentWeekStart = getWeekStart();
  return stored.getTime() < currentWeekStart.getTime();
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 * Examples: "2m", "14m", "1h 23m"
 */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / (1000 * 60));

  if (totalMinutes < 1) {
    return '<1m';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Returns today's date as a YYYY-MM-DD string in local time.
 */
export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

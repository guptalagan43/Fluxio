// src/background/budgetManager.ts
// Checks weekly budget thresholds and fires browser notifications.
// Per architecture.md Section 4.5 — notifications fire once per threshold per budget period.

import { getBudget, setBudget } from '../utils/storage';
import { isNewWeek, getWeekStart } from '../utils/time';

export async function checkThresholds(): Promise<void> {
  const budget = await getBudget();

  // Reset budget if a new week has started
  if (isNewWeek(budget.weekStartDate)) {
    const updatedBudget = {
      ...budget,
      currentWeekUSD: 0,
      weekStartDate: getWeekStart().toISOString().slice(0, 10),
      notified50: false,
      notified80: false,
      notified100: false,
    };
    await setBudget(updatedBudget);
    return;
  }

  if (!budget.notificationsEnabled) return;
  if (budget.weeklyLimitUSD <= 0) return;

  const ratio = budget.currentWeekUSD / budget.weeklyLimitUSD;
  let changed = false;

  if (ratio >= 1.0 && !budget.notified100) {
    await fireNotification(
      'budget-100',
      'Budget exceeded',
      `You've exceeded your $${budget.weeklyLimitUSD.toFixed(2)} weekly budget.`
    );
    budget.notified100 = true;
    changed = true;
  }

  if (ratio >= 0.8 && !budget.notified80) {
    await fireNotification(
      'budget-80',
      '80% of budget used',
      `You're at 80% of your $${budget.weeklyLimitUSD.toFixed(2)} weekly budget.`
    );
    budget.notified80 = true;
    changed = true;
  }

  if (ratio >= 0.5 && !budget.notified50) {
    await fireNotification(
      'budget-50',
      '50% of budget used',
      `You're at 50% of your $${budget.weeklyLimitUSD.toFixed(2)} weekly budget.`
    );
    budget.notified50 = true;
    changed = true;
  }

  if (changed) {
    await setBudget(budget);
  }
}

async function fireNotification(id: string, title: string, message: string): Promise<void> {
  try {
    await chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
      title: `AI Token Tracker — ${title}`,
      message,
    });
  } catch (err) {
    console.error('[AI Token Tracker] Failed to create notification:', err);
  }
}

// src/services/settingsService.ts
// Settings management and data deletion services for authenticated users.

import { prisma } from '../config/prisma.js';
import type { UpdateSettingsInput } from '../schemas/api.schemas.js';

export async function getUserSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        weeklyLimitUsd: 5.0,
        syncEnabled: true,
      },
    });
  }

  return {
    userId: settings.userId,
    weeklyLimitUsd: Number(settings.weeklyLimitUsd),
    syncEnabled: settings.syncEnabled,
    notify50: settings.notify50,
    notify80: settings.notify80,
    notify100: settings.notify100,
    preferredQuick: settings.preferredQuick,
    preferredCode: settings.preferredCode,
    preferredLong: settings.preferredLong,
    preferredCreative: settings.preferredCreative,
  };
}

export async function updateUserSettings(userId: string, data: UpdateSettingsInput) {
  const updated = await prisma.userSettings.upsert({
    where: { userId },
    update: {
      ...(data.weeklyLimitUsd !== undefined && { weeklyLimitUsd: data.weeklyLimitUsd }),
      ...(data.syncEnabled !== undefined && { syncEnabled: data.syncEnabled }),
      ...(data.notify50 !== undefined && { notify50: data.notify50 }),
      ...(data.notify80 !== undefined && { notify80: data.notify80 }),
      ...(data.notify100 !== undefined && { notify100: data.notify100 }),
      ...(data.preferredQuick && { preferredQuick: data.preferredQuick }),
      ...(data.preferredCode && { preferredCode: data.preferredCode }),
      ...(data.preferredLong && { preferredLong: data.preferredLong }),
      ...(data.preferredCreative && { preferredCreative: data.preferredCreative }),
    },
    create: {
      userId,
      weeklyLimitUsd: data.weeklyLimitUsd ?? 5.0,
      syncEnabled: data.syncEnabled ?? true,
      notify50: data.notify50 ?? true,
      notify80: data.notify80 ?? true,
      notify100: data.notify100 ?? true,
      preferredQuick: data.preferredQuick ?? 'gpt-4o-mini',
      preferredCode: data.preferredCode ?? 'claude-sonnet',
      preferredLong: data.preferredLong ?? 'gemini-1.5-pro',
      preferredCreative: data.preferredCreative ?? 'claude-sonnet',
    },
  });

  return {
    userId: updated.userId,
    weeklyLimitUsd: Number(updated.weeklyLimitUsd),
    syncEnabled: updated.syncEnabled,
    notify50: updated.notify50,
    notify80: updated.notify80,
    notify100: updated.notify100,
    preferredQuick: updated.preferredQuick,
    preferredCode: updated.preferredCode,
    preferredLong: updated.preferredLong,
    preferredCreative: updated.preferredCreative,
  };
}

export async function deleteUserData(userId: string) {
  // Cascading delete deletes usageEvents, settings, and user row
  const deleted = await prisma.user.delete({
    where: { id: userId },
  });

  return { message: 'Account and all associated usage data deleted successfully', deletedUserId: deleted.id };
}

// src/controllers/apiController.ts
// Thin HTTP controller for dashboard usage and settings endpoints.

import type { Request, Response } from 'express';
import { getUsageForUser } from '../services/usageService.js';
import { getUserSettings, updateUserSettings, deleteUserData } from '../services/settingsService.js';

export async function getUsage(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const rangeQuery = (req.query.range as string) || '7d';
  const days = parseInt(rangeQuery.replace('d', ''), 10) || 7;

  try {
    const data = await getUsageForUser(req.user.id, days);
    res.status(200).json(data);
  } catch (err) {
    console.error('[API CONTROLLER] Error fetching usage:', err);
    res.status(500).json({ error: 'Failed to retrieve usage data' });
  }
}

export async function getSettings(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const data = await getUserSettings(req.user.id);
    res.status(200).json(data);
  } catch (err) {
    console.error('[API CONTROLLER] Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const updated = await updateUserSettings(req.user.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error('[API CONTROLLER] Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

export async function deleteData(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const result = await deleteUserData(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    console.error('[API CONTROLLER] Error deleting user data:', err);
    res.status(500).json({ error: 'Failed to delete user data' });
  }
}

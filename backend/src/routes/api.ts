// src/routes/api.ts
// Express router for protected API endpoints (usage, settings, data deletion).

import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { userApiLimiter, settingsLimiter, dataDeleteLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../schemas/api.schemas.js';
import { getUsage, getSettings, updateSettings, deleteData } from '../controllers/apiController.js';

const router = Router();

router.get('/api/usage', authenticateJWT, userApiLimiter, getUsage);

router.get('/api/settings', authenticateJWT, userApiLimiter, getSettings);

router.put(
  '/api/settings',
  authenticateJWT,
  settingsLimiter,
  validate(updateSettingsSchema),
  updateSettings
);

router.delete('/api/data', authenticateJWT, dataDeleteLimiter, deleteData);

export default router;

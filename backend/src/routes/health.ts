// src/routes/health.ts
// GET /health — returns server status.
// Used by Railway health checks and local dev verification.

import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;

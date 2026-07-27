// src/middleware/notFoundHandler.ts
// 404 handler for unknown routes.

import type { RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

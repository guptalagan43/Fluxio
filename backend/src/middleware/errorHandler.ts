// src/middleware/errorHandler.ts
// Global error handler.
// Per rules.md SEC-09: error responses never include stack traces or internal details.

import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err instanceof Error ? err.message : err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: statusCode === 500
      ? 'Internal server error'
      : (err instanceof Error ? err.message : 'An error occurred'),
  });
};

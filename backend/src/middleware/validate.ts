// src/middleware/validate.ts
// Middleware factory for validating request bodies against Zod schemas.

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return res.status(400).json({
          error: 'Validation failed',
          details: issues,
        });
      }
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

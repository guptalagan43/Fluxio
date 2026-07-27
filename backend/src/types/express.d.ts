// src/types/express.d.ts
// Extends Express Request with authenticated user information.
// Per architecture.md: authMiddleware decodes JWT and attaches user to req.

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};

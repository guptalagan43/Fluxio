// src/middleware/authenticateJWT.ts
// Verifies JWT from cookie or Authorization header and attaches req.user.
// Per PRD Section 10.4 — includes 24h sliding window token auto-refresh.

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = req.cookies?.jwt;
  const headerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const token = cookieToken || headerToken;

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('[FATAL] JWT_SECRET environment variable is missing');
    res.status(500).json({ error: 'Internal server configuration error' });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    // Sliding window refresh: if token expires within 24 hours (86,400s), issue a fresh 7d token
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - nowInSeconds;

    if (timeUntilExpiry > 0 && timeUntilExpiry < 86400) {
      const refreshedToken = jwt.sign(
        { sub: payload.sub, email: payload.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('jwt', refreshedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.setHeader('X-Refreshed-Token', refreshedToken);
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

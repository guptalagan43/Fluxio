// src/middleware/rateLimiters.ts
// Rate limiter instances for auth and API endpoints per PRD Section 10.2.

import rateLimit from 'express-rate-limit';

// IP-based limiter for OTP requests (5 per 10 min)
export const otpIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown-ip',
  message: { error: 'Too many OTP requests from this IP. Try again in 10 minutes.' },
});

// Email-based limiter for OTP requests (3 per 10 min)
export const otpEmailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body?.email ? String(req.body.email).toLowerCase().trim() : req.ip || 'unknown-ip'),
  message: { error: 'Too many OTP requests for this email. Try again in 10 minutes.' },
});

// Verify OTP rate limiter (10 per 10 min)
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown-ip',
  message: { error: 'Too many verification attempts. Try again in 10 minutes.' },
});

// Per-user API limiter (30 per min)
export const userApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: { error: 'Request limit reached. Please wait a moment.' },
});

// Sync endpoint limiter (12 per hour)
export const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: { error: 'Sync rate limit reached. Please try again later.' },
});

// Settings update limiter (10 per min)
export const settingsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: { error: 'Settings update limit reached.' },
});

// Data deletion limiter (3 per hour)
export const dataDeleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: { error: 'Data deletion limit reached.' },
});

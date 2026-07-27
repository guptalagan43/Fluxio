// src/app.ts
// Express application with all middleware registered in correct order.
// Per architecture.md Section 7.2 — middleware order matters.

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import healthRouter from './routes/health.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

// Note: env.ts validation is skipped at import time for Phase 1.
// It will be imported in server.ts once all env vars are configured.

const app = express();

// ── Security headers ────────────────────────────────────────────────
app.use(helmet());

// ── CORS — explicit origin list, never use '*' (SEC-06) ─────────────
const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ── Body parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Cookie parsing ──────────────────────────────────────────────────
app.use(cookieParser());

// ── HTTP parameter pollution ────────────────────────────────────────
app.use(hpp());

// ── Compression ─────────────────────────────────────────────────────
app.use(compression());

// ── Logging ─────────────────────────────────────────────────────────
app.use(morgan('combined'));

// ── Global rate limiter ─────────────────────────────────────────────
// Per rules.md SEC-05: rate limiters are active in all environments.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

// ── Routes ──────────────────────────────────────────────────────────
app.use(healthRouter);

// Stubs for future route groups — added in later phases:
// app.use('/auth', authRouter);
// app.use('/api', apiRouter);

// ── Error handling ──────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

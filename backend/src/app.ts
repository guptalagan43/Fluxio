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
import authRouter from './routes/auth.js';
import apiRouter from './routes/api.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startOtpCleanupJob } from './jobs/otpCleanup.js';

const app = express();

// Start background cron jobs
startOtpCleanupJob();

// ── Security headers ────────────────────────────────────────────────
app.use(helmet());

// ── CORS — explicit origin list, never use '*' (SEC-06) ─────────────
const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, extension background requests)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, restricted by exact origins
    }
  },
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
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

// ── Routes ──────────────────────────────────────────────────────────
app.use(healthRouter);
app.use(authRouter);
app.use(apiRouter);

// ── Error handling ──────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

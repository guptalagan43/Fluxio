// src/config/env.ts
// Startup validation for all required environment variables.
// Per rules.md SEC-08: if any required variable is missing, the server exits immediately.

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  GMAIL_USER: string;
  GMAIL_APP_PASSWORD: string;
  FRONTEND_URL: string;
  EXTENSION_ID: string;
  REDIS_URL: string;
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

function validateEnv(): EnvConfig {
  const config: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: parseInt(process.env.PORT ?? '3000', 10),
    DATABASE_URL: getRequiredEnv('DATABASE_URL'),
    JWT_SECRET: getRequiredEnv('JWT_SECRET'),
    GMAIL_USER: getRequiredEnv('GMAIL_USER'),
    GMAIL_APP_PASSWORD: getRequiredEnv('GMAIL_APP_PASSWORD'),
    FRONTEND_URL: getRequiredEnv('FRONTEND_URL'),
    EXTENSION_ID: getRequiredEnv('EXTENSION_ID'),
    REDIS_URL: getRequiredEnv('REDIS_URL'),
  };

  // SEC-01: JWT_SECRET must be ≥ 256 bits (32 bytes hex = 64 hex chars)
  if (config.JWT_SECRET.length < 64) {
    console.error('[FATAL] JWT_SECRET must be at least 64 hex characters (256 bits). Generate with: openssl rand -hex 32');
    process.exit(1);
  }

  return config;
}

export const env = validateEnv();

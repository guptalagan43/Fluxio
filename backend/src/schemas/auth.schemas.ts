// src/schemas/auth.schemas.ts
// Zod schemas for authentication endpoints per PRD Section 10.3.

import { z } from 'zod';

export const requestOtpSchema = z.object({
  email: z.string().email('Invalid email address').max(254).toLowerCase().trim(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address').max(254).toLowerCase().trim(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

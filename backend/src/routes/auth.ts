// src/routes/auth.ts
// Express router for authentication endpoints per PRD Section 10.2.

import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requestOtpSchema, verifyOtpSchema } from '../schemas/auth.schemas.js';
import { otpIpLimiter, otpEmailLimiter, otpVerifyLimiter } from '../middleware/rateLimiters.js';
import { requestOtp, verifyOtp, logout, me } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = Router();

router.post(
  '/auth/request-otp',
  otpIpLimiter,
  otpEmailLimiter,
  validate(requestOtpSchema),
  requestOtp
);

router.post(
  '/auth/verify-otp',
  otpVerifyLimiter,
  validate(verifyOtpSchema),
  verifyOtp
);

router.post('/auth/logout', logout);

router.get('/auth/me', authenticateJWT, me);

export default router;

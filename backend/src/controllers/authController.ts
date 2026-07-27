// src/controllers/authController.ts
// Thin HTTP controller for authentication endpoints.

import type { Request, Response } from 'express';
import { requestOtp as requestOtpService, verifyOtp as verifyOtpService } from '../services/authService.js';

export async function requestOtp(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  const result = await requestOtpService(email);

  if (!result.ok) {
    res.status(result.statusCode || 500).json({ error: result.error });
    return;
  }

  res.status(200).json(result.data);
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const { email, otp } = req.body;
  const result = await verifyOtpService(email, otp);

  if (!result.ok || !result.data) {
    res.status(result.statusCode || 400).json({ error: result.error });
    return;
  }

  // Set httpOnly cookie for website auth
  res.cookie('jwt', result.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json(result.data);
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.status(200).json({ user: req.user });
}

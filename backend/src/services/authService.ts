// src/services/authService.ts
// Service layer for OTP generation, hashing, database verification, and JWT issuance.
// Uses Prisma transactions for atomic multi-model writes per PRD Section 8.1.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { sendOtpEmail } from './emailService.js';

export interface ServiceResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export async function requestOtp(email: string): Promise<ServiceResult<{ message: string }>> {
  try {
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpRecord.create({
      data: {
        email,
        otpHash,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    await sendOtpEmail(email, rawOtp);

    return {
      ok: true,
      data: { message: 'OTP sent to your email address' },
    };
  } catch (err) {
    console.error('[AUTH SERVICE] Error in requestOtp:', err);
    return {
      ok: false,
      error: 'Failed to process OTP request',
      statusCode: 500,
    };
  }
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<ServiceResult<{ token: string; user: { id: string; email: string } }>> {
  try {
    // Find active OTP record
    const record = await prisma.otpRecord.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return {
        ok: false,
        error: 'Invalid or expired verification code',
        statusCode: 400,
      };
    }

    if (record.attempts >= 5) {
      return {
        ok: false,
        error: 'Too many failed verification attempts. Please request a new code.',
        statusCode: 429,
      };
    }

    // Increment attempts
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return {
        ok: false,
        error: 'Incorrect verification code',
        statusCode: 401,
      };
    }

    // Mark as used
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { used: true },
    });

    // Upsert User and UserSettings in a single transaction
    const user = await prisma.$transaction(async (tx) => {
      let existingUser = await tx.user.findUnique({ where: { email } });
      if (!existingUser) {
        existingUser = await tx.user.create({
          data: {
            email,
            settings: {
              create: {
                weeklyLimitUsd: 5.0,
                syncEnabled: true,
              },
            },
          },
        });
      }
      return existingUser;
    });

    // Sign JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      ok: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    };
  } catch (err) {
    console.error('[AUTH SERVICE] Error in verifyOtp:', err);
    return {
      ok: false,
      error: 'Verification processing error',
      statusCode: 500,
    };
  }
}

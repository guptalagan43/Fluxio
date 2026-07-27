// src/jobs/otpCleanup.ts
// Hourly cron job for cleaning up expired and used OTP records per PRD Section 10.5.

import cron from 'node-cron';
import { prisma } from '../config/prisma.js';

export function startOtpCleanupJob(): void {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await prisma.otpRecord.deleteMany({
        where: {
          OR: [
            { used: true },
            { expiresAt: { lt: new Date() } },
          ],
        },
      });
      console.info(`[CRON] Cleaned up ${result.count} expired/used OTP records.`);
    } catch (err) {
      console.error('[CRON ERROR] Failed to clean up OTP records:', err);
    }
  });
}

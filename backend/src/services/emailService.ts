// src/services/emailService.ts
// Sends OTP emails using Nodemailer with Gmail SMTP App Password per PRD Section 8.1.

import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

let transporter: nodemailer.Transporter | null = null;

if (GMAIL_USER && GMAIL_APP_PASSWORD && GMAIL_APP_PASSWORD !== 'xxxx-xxxx-xxxx-xxxx') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const subject = `Your verification code — [${otp}]`;
  const textBody = `Hi,

Your one-time sign-in code is:

  [${otp}]

This code expires in 5 minutes and can only be used once.
Do not share this code with anyone.

If you did not request this, you can safely ignore this email.
No action is required.

— The AI Token Tracker Team
https://yourwebsite.com`;

  if (!transporter) {
    console.info(`[DEV EMAIL FALLBACK] Target: ${email} | Subject: ${subject} | OTP: ${otp}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `AI Token Tracker <${GMAIL_USER}>`,
      to: email,
      subject,
      text: textBody,
    });
    console.info(`[EMAIL] OTP sent successfully to ${email}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}:`, err);
    // In dev mode, fall back to console logging so testing can proceed
    console.info(`[DEV EMAIL FALLBACK] Target: ${email} | OTP: ${otp}`);
    return false;
  }
}

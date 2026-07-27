// src/config/prisma.ts
// Singleton PrismaClient instance.
// Per rules.md SEC-04: all SQL goes through Prisma typed methods.

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

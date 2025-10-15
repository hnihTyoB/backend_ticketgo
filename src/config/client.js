import { PrismaClient } from '@prisma/client';
import process from 'process';
import 'dotenv/config';

const globalForPrisma = globalThis;

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log:
            process.env.NODE_ENV === 'development'
                ? ['query', 'info', 'warn', 'error']
                : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
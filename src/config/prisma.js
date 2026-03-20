import { PrismaClient } from '@prisma/client';

// Singleton to avoid multiple connections in development (hot-reload)
const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;

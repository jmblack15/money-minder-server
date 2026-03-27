import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Singleton to avoid multiple connections in development (hot-reload)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = global.__prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;

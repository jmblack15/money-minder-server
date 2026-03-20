import 'dotenv/config';

const required = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const DATABASE_URL          = process.env.DATABASE_URL;
export const REDIS_URL             = process.env.REDIS_URL;
export const JWT_SECRET            = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET    = process.env.JWT_REFRESH_SECRET;
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
export const JWT_REFRESH_EXPIRES_IN= process.env.JWT_REFRESH_EXPIRES_IN || '7d';
export const PORT                  = parseInt(process.env.PORT || '3000', 10);
export const NODE_ENV              = process.env.NODE_ENV || 'development';

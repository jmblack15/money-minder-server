import { z } from 'zod';

const accountTypeEnum = z.enum(['BANK', 'CASH', 'CREDIT_CARD', 'SAVINGS']);

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: accountTypeEnum,
  balance: z.number().default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hex válido (#RRGGBB)').optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: accountTypeEnum.optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
});

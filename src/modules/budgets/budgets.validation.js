import { z } from 'zod';

const periodEnum = z.enum(['WEEKLY', 'MONTHLY']);

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid('categoryId debe ser UUID'),
  amount:     z.number().positive('El monto debe ser positivo'),
  period:     periodEnum,
  startDate:  z.coerce.date(),
  alertAt:    z.number().int().min(1).max(100).default(80),
});

export const updateBudgetSchema = z.object({
  amount:   z.number().positive().optional(),
  period:   periodEnum.optional(),
  startDate: z.coerce.date().optional(),
  alertAt:  z.number().int().min(1).max(100).optional(),
});

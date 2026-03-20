import { z } from 'zod';

export const createGoalSchema = z.object({
  name:          z.string().min(1).max(100),
  targetAmount:  z.number().positive('El monto objetivo debe ser positivo'),
  currentAmount: z.number().min(0).default(0),
  deadline:      z.coerce.date().optional(),
});

export const updateGoalSchema = z.object({
  name:          z.string().min(1).max(100).optional(),
  targetAmount:  z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  deadline:      z.coerce.date().optional().nullable(),
  status:        z.enum(['ACTIVE', 'COMPLETED']).optional(),
});

import { z } from 'zod';

const categoryTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const createCategorySchema = z.object({
  name: z.string().min(1).max(80),
  type: categoryTypeEnum,
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(80).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

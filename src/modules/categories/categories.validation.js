const { z } = require('zod');

const categoryTypeEnum = z.enum(['INCOME', 'EXPENSE']);

const createCategorySchema = z.object({
  name: z.string().min(1).max(80),
  type: categoryTypeEnum,
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(80).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };

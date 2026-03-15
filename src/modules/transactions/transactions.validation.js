const { z } = require('zod');

const transactionTypeEnum = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);

const createTransactionSchema = z.object({
  accountId: z.string().uuid('accountId debe ser UUID'),
  categoryId: z.string().uuid('categoryId debe ser UUID'),
  toAccountId: z.string().uuid().optional(), // solo para TRANSFER
  amount: z.number().positive('El monto debe ser positivo'),
  type: transactionTypeEnum,
  description: z.string().min(1).max(200),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.type !== 'TRANSFER' || !!data.toAccountId,
  { message: 'toAccountId es requerido para transferencias', path: ['toAccountId'] }
);

const updateTransactionSchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  toAccountId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  type: transactionTypeEnum.optional(),
  description: z.string().min(1).max(200).optional(),
  date: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

const listTransactionsSchema = z.object({
  accountId:  z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type:       transactionTypeEnum.optional(),
  dateFrom:   z.coerce.date().optional(),
  dateTo:     z.coerce.date().optional(),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  offset:     z.coerce.number().int().min(0).default(0),
});

module.exports = { createTransactionSchema, updateTransactionSchema, listTransactionsSchema };

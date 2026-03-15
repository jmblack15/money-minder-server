const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar los 72 caracteres'),
  currency: z.string().length(3).toUpperCase().optional().default('COP'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es requerido'),
});

module.exports = { registerSchema, loginSchema, refreshSchema };

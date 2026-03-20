import { NODE_ENV } from '../config/env.js';

/**
 * Maps Prisma error codes to appropriate HTTP status codes.
 */
function getPrismaHttpStatus(code) {
  const map = {
    P2002: 409, // Unique constraint violation
    P2025: 404, // Record not found
    P2003: 400, // Foreign key constraint failed
    P2014: 400, // Relation violation
  };
  return map[code] || 500;
}

/**
 * Global error handling middleware.
 * Must be registered LAST in Express.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Zod validation errors (thrown from validate middleware)
  if (err.name === 'ZodValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: err.errors,
    });
  }

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    const status = getPrismaHttpStatus(err.code);
    let message = 'Error de base de datos';

    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'campo';
      message = `Ya existe un registro con ese ${field}`;
    } else if (err.code === 'P2025') {
      message = 'Registro no encontrado';
    }

    return res.status(status).json({ success: false, message });
  }

  // Errors with explicit HTTP status (thrown with new Error() + err.statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Generic error
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

export default errorHandler;

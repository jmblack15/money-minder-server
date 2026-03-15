const { NODE_ENV } = require('../config/env');

/**
 * Mapea códigos de error de Prisma a HTTP status codes apropiados.
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
 * Middleware global de manejo de errores.
 * Debe registrarse ÚLTIMO en Express.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Errores de validación de Zod (lanzados desde validate middleware)
  if (err.name === 'ZodValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: err.errors,
    });
  }

  // Errores de Prisma
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

  // Errores con status HTTP explícito (lanzados con new Error() + err.statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Error genérico
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;

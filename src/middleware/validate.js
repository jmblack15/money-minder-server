/**
 * Factory de middleware para validar req.body con un schema de Zod.
 * Uso: router.post('/ruta', validate(myZodSchema), controller)
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const err = new Error('Datos de entrada inválidos');
      err.name = 'ZodValidationError';
      err.errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(err);
    }

    // Reemplaza req.body con los datos parseados/coercionados por Zod
    req.body = result.data;
    next();
  };
}

module.exports = validate;

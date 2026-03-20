/**
 * Middleware factory to validate req.body with a Zod schema.
 * Usage: router.post('/route', validate(myZodSchema), controller)
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

    // Replace req.body with Zod-parsed/coerced data
    req.body = result.data;
    next();
  };
}

export default validate;

import passport from '../config/passport.js';

/**
 * Authenticates the request via passport-jwt.
 * On success, sets req.user = { id, email } and req.token.
 * Returns consistent 401 JSON on any auth failure.
 */
function authMiddleware(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      const message = info?.message ?? 'Token de acceso requerido';
      return res.status(401).json({ success: false, message });
    }

    req.user = user;
    next();
  })(req, res, next);
}

export default authMiddleware;

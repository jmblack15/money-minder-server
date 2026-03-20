import jwt from 'jsonwebtoken';
import redis from '../config/redis.js';
import { JWT_SECRET } from '../config/env.js';

/**
 * Verifies the JWT access token in the Authorization header.
 * Attaches req.user = { id, email } if valid.
 * Rejects tokens that are in the Redis blacklist (logout).
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
    }

    const token = authHeader.split(' ')[1];

    // Check if the token was invalidated (logout)
    const blacklisted = await redis.get(`blacklist:${token}`);
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Por favor inicia sesión nuevamente.',
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    req.token = token; // useful for logout

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Usa el refresh token para renovarlo.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido.',
    });
  }
}

export default authMiddleware;

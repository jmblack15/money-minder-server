const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const { JWT_SECRET } = require('../config/env');

/**
 * Verifica el access token JWT en el header Authorization.
 * Adjunta req.user = { id, email } si es válido.
 * Rechaza tokens que estén en la blacklist de Redis (logout).
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

    // Verificar si el token fue invalidado (logout)
    const blacklisted = await redis.get(`blacklist:${token}`);
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Por favor inicia sesión nuevamente.',
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    req.token = token; // útil para logout

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

module.exports = authMiddleware;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const redis = require('../../config/redis');
const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = require('../../config/env');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convierte "15m", "7d", etc. a segundos para Redis TTL.
 */
function parseDurationToSeconds(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 min
  const [, value, unit] = match;
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(value) * multipliers[unit];
}

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

// ─── Service functions ────────────────────────────────────────────────────────

async function register({ name, email, password, currency }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Ya existe una cuenta con ese email');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, currency },
    select: { id: true, name: true, email: true, currency: true, createdAt: true },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Guardar refresh token en Redis: refresh:<userId> → token
  const refreshTTL = parseDurationToSeconds(JWT_REFRESH_EXPIRES_IN);
  await redis.setex(`refresh:${user.id}`, refreshTTL, refreshToken);

  return { user, accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error('Credenciales inválidas');
    err.statusCode = 401;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const err = new Error('Credenciales inválidas');
    err.statusCode = 401;
    throw err;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshTTL = parseDurationToSeconds(JWT_REFRESH_EXPIRES_IN);
  await redis.setex(`refresh:${user.id}`, refreshTTL, refreshToken);

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

async function refreshAccessToken(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('Refresh token inválido o expirado');
    err.statusCode = 401;
    throw err;
  }

  // Validar que el token almacenado en Redis coincida (single-session)
  const stored = await redis.get(`refresh:${payload.sub}`);
  if (!stored || stored !== refreshToken) {
    const err = new Error('Refresh token inválido o ya fue usado');
    err.statusCode = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true },
  });

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  const newAccessToken = generateAccessToken(user);
  return { accessToken: newAccessToken };
}

async function logout(accessToken, userId) {
  // Obtener el TTL restante del access token para usarlo en Redis
  let ttl = parseDurationToSeconds(JWT_ACCESS_EXPIRES_IN);
  try {
    const decoded = jwt.decode(accessToken);
    if (decoded?.exp) {
      ttl = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    }
  } catch { /* ignorar */ }

  // Blacklist el access token hasta que expire naturalmente
  if (ttl > 0) {
    await redis.setex(`blacklist:${accessToken}`, ttl, '1');
  }

  // Eliminar el refresh token del usuario
  await redis.del(`refresh:${userId}`);
}

module.exports = { register, login, refreshAccessToken, logout };

const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { accessToken } = await authService.refreshAccessToken(req.body.refreshToken);
    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.token, req.user.id);
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout };

import * as authService from './auth.service.js';
import { successResponse } from '../../utils/responseHandler.js';

export async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    successResponse(res, 201, 'Usuario registrado exitosamente', { user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    successResponse(res, 200, 'Inicio de sesión exitoso', { user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { accessToken } = await authService.refreshAccessToken(req.body.refreshToken);
    successResponse(res, 200, 'Token renovado exitosamente', { accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.token, req.user.id);
    successResponse(res, 200, 'Sesión cerrada exitosamente', null);
  } catch (err) {
    next(err);
  }
}

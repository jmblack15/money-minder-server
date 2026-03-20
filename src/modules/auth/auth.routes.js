import { Router } from 'express';
import * as controller from './auth.controller.js';
import validate from '../../middleware/validate.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login',    validate(loginSchema),    controller.login);
router.post('/refresh',  validate(refreshSchema),  controller.refresh);
router.post('/logout',   authMiddleware,            controller.logout);

export default router;

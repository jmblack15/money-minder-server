const { Router } = require('express');
const controller = require('./auth.controller');
const validate = require('../../middleware/validate');
const authMiddleware = require('../../middleware/authMiddleware');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.validation');

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login',    validate(loginSchema),    controller.login);
router.post('/refresh',  validate(refreshSchema),  controller.refresh);
router.post('/logout',   authMiddleware,            controller.logout);

module.exports = router;

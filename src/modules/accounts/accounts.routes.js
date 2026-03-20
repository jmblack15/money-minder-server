import { Router } from 'express';
import * as controller from './accounts.controller.js';
import validate from '../../middleware/validate.js';
import { createAccountSchema, updateAccountSchema } from './accounts.validation.js';

const router = Router();

router.get('/',     controller.getAccounts);
router.get('/:id',  controller.getAccount);
router.post('/',    validate(createAccountSchema), controller.createAccount);
router.put('/:id',  validate(updateAccountSchema), controller.updateAccount);
router.delete('/:id', controller.deleteAccount);

export default router;

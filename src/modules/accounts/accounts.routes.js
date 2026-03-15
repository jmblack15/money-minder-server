const { Router } = require('express');
const controller = require('./accounts.controller');
const validate = require('../../middleware/validate');
const { createAccountSchema, updateAccountSchema } = require('./accounts.validation');

const router = Router();

router.get('/',     controller.getAccounts);
router.get('/:id',  controller.getAccount);
router.post('/',    validate(createAccountSchema), controller.createAccount);
router.put('/:id',  validate(updateAccountSchema), controller.updateAccount);
router.delete('/:id', controller.deleteAccount);

module.exports = router;

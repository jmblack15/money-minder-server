const { Router } = require('express');
const controller = require('./transactions.controller');
const validate = require('../../middleware/validate');
const { createTransactionSchema, updateTransactionSchema } = require('./transactions.validation');

const router = Router();

router.get('/',     controller.getTransactions);
router.get('/:id',  controller.getTransaction);
router.post('/',    validate(createTransactionSchema), controller.createTransaction);
router.put('/:id',  validate(updateTransactionSchema), controller.updateTransaction);
router.delete('/:id', controller.deleteTransaction);

module.exports = router;

import { Router } from 'express';
import * as controller from './transactions.controller.js';
import validate from '../../middleware/validate.js';
import { createTransactionSchema, updateTransactionSchema } from './transactions.validation.js';

const router = Router();

router.get('/',     controller.getTransactions);
router.get('/:id',  controller.getTransaction);
router.post('/',    validate(createTransactionSchema), controller.createTransaction);
router.put('/:id',  validate(updateTransactionSchema), controller.updateTransaction);
router.delete('/:id', controller.deleteTransaction);

export default router;

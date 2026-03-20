import { Router } from 'express';
import * as controller from './budgets.controller.js';
import validate from '../../middleware/validate.js';
import { createBudgetSchema, updateBudgetSchema } from './budgets.validation.js';

const router = Router();

router.get('/',     controller.getBudgets);
router.get('/:id',  controller.getBudget);
router.post('/',    validate(createBudgetSchema), controller.createBudget);
router.put('/:id',  validate(updateBudgetSchema), controller.updateBudget);
router.delete('/:id', controller.deleteBudget);

export default router;

const { Router } = require('express');
const controller = require('./budgets.controller');
const validate = require('../../middleware/validate');
const { createBudgetSchema, updateBudgetSchema } = require('./budgets.validation');

const router = Router();

router.get('/',     controller.getBudgets);
router.get('/:id',  controller.getBudget);
router.post('/',    validate(createBudgetSchema), controller.createBudget);
router.put('/:id',  validate(updateBudgetSchema), controller.updateBudget);
router.delete('/:id', controller.deleteBudget);

module.exports = router;

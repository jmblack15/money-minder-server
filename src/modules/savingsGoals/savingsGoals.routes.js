const { Router } = require('express');
const controller = require('./savingsGoals.controller');
const validate = require('../../middleware/validate');
const { createGoalSchema, updateGoalSchema } = require('./savingsGoals.validation');

const router = Router();

router.get('/',     controller.getGoals);
router.get('/:id',  controller.getGoal);
router.post('/',    validate(createGoalSchema), controller.createGoal);
router.put('/:id',  validate(updateGoalSchema), controller.updateGoal);
router.delete('/:id', controller.deleteGoal);

module.exports = router;

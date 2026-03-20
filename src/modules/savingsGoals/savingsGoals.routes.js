import { Router } from 'express';
import * as controller from './savingsGoals.controller.js';
import validate from '../../middleware/validate.js';
import { createGoalSchema, updateGoalSchema } from './savingsGoals.validation.js';

const router = Router();

router.get('/',     controller.getGoals);
router.get('/:id',  controller.getGoal);
router.post('/',    validate(createGoalSchema), controller.createGoal);
router.put('/:id',  validate(updateGoalSchema), controller.updateGoal);
router.delete('/:id', controller.deleteGoal);

export default router;

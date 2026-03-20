import { Router } from 'express';
import * as controller from './categories.controller.js';
import validate from '../../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from './categories.validation.js';

const router = Router();

router.get('/',     controller.getCategories);
router.post('/',    validate(createCategorySchema), controller.createCategory);
router.put('/:id',  validate(updateCategorySchema), controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

export default router;

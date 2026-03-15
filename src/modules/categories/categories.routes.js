const { Router } = require('express');
const controller = require('./categories.controller');
const validate = require('../../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('./categories.validation');

const router = Router();

router.get('/',     controller.getCategories);
router.post('/',    validate(createCategorySchema), controller.createCategory);
router.put('/:id',  validate(updateCategorySchema), controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

module.exports = router;

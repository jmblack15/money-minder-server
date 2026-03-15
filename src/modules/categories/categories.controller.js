const service = require('./categories.service');

async function getCategories(req, res, next) {
  try {
    const categories = await service.getCategories(req.user.id);
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
}

async function createCategory(req, res, next) {
  try {
    const category = await service.createCategory(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Categoría creada', data: category });
  } catch (err) { next(err); }
}

async function updateCategory(req, res, next) {
  try {
    const category = await service.updateCategory(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Categoría actualizada', data: category });
  } catch (err) { next(err); }
}

async function deleteCategory(req, res, next) {
  try {
    await service.deleteCategory(req.params.id, req.user.id);
    res.json({ success: true, message: 'Categoría eliminada', data: null });
  } catch (err) { next(err); }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

const service = require('./savingsGoals.service');

async function getGoals(req, res, next) {
  try {
    const goals = await service.getGoals(req.user.id);
    res.json({ success: true, data: goals });
  } catch (err) { next(err); }
}

async function getGoal(req, res, next) {
  try {
    const goal = await service.getGoalById(req.params.id, req.user.id);
    res.json({ success: true, data: goal });
  } catch (err) { next(err); }
}

async function createGoal(req, res, next) {
  try {
    const goal = await service.createGoal(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Meta de ahorro creada', data: goal });
  } catch (err) { next(err); }
}

async function updateGoal(req, res, next) {
  try {
    const goal = await service.updateGoal(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Meta de ahorro actualizada', data: goal });
  } catch (err) { next(err); }
}

async function deleteGoal(req, res, next) {
  try {
    await service.deleteGoal(req.params.id, req.user.id);
    res.json({ success: true, message: 'Meta de ahorro eliminada', data: null });
  } catch (err) { next(err); }
}

module.exports = { getGoals, getGoal, createGoal, updateGoal, deleteGoal };

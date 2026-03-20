import * as service from './budgets.service.js';

export async function getBudgets(req, res, next) {
  try {
    const budgets = await service.getBudgets(req.user.id);
    res.json({ success: true, data: budgets });
  } catch (err) { next(err); }
}

export async function getBudget(req, res, next) {
  try {
    const budget = await service.getBudgetById(req.params.id, req.user.id);
    res.json({ success: true, data: budget });
  } catch (err) { next(err); }
}

export async function createBudget(req, res, next) {
  try {
    const budget = await service.createBudget(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Presupuesto creado', data: budget });
  } catch (err) { next(err); }
}

export async function updateBudget(req, res, next) {
  try {
    const budget = await service.updateBudget(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Presupuesto actualizado', data: budget });
  } catch (err) { next(err); }
}

export async function deleteBudget(req, res, next) {
  try {
    await service.deleteBudget(req.params.id, req.user.id);
    res.json({ success: true, message: 'Presupuesto eliminado', data: null });
  } catch (err) { next(err); }
}

import * as service from './reports.service.js';

export async function summary(req, res, next) {
  try {
    const data = await service.getSummary(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function byCategory(req, res, next) {
  try {
    const { dateFrom, dateTo } = req.query;
    const data = await service.getByCategory(req.user.id, { dateFrom, dateTo });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function monthlyTrend(req, res, next) {
  try {
    const data = await service.getMonthlyTrend(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function accountBalances(req, res, next) {
  try {
    const data = await service.getAccountBalances(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

const service = require('./reports.service');

async function summary(req, res, next) {
  try {
    const data = await service.getSummary(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function byCategory(req, res, next) {
  try {
    const { dateFrom, dateTo } = req.query;
    const data = await service.getByCategory(req.user.id, { dateFrom, dateTo });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function monthlyTrend(req, res, next) {
  try {
    const data = await service.getMonthlyTrend(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function accountBalances(req, res, next) {
  try {
    const data = await service.getAccountBalances(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { summary, byCategory, monthlyTrend, accountBalances };

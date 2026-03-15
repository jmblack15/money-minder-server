const { Router } = require('express');
const controller = require('./reports.controller');

const router = Router();

router.get('/summary',          controller.summary);
router.get('/by-category',      controller.byCategory);
router.get('/monthly-trend',    controller.monthlyTrend);
router.get('/account-balances', controller.accountBalances);

module.exports = router;

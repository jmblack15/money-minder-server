import { Router } from 'express';
import * as controller from './reports.controller.js';

const router = Router();

router.get('/summary',          controller.summary);
router.get('/by-category',      controller.byCategory);
router.get('/monthly-trend',    controller.monthlyTrend);
router.get('/account-balances', controller.accountBalances);

export default router;

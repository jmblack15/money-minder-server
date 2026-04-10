import { Router } from 'express';
import * as controller from './reports.controller.js';

const router = Router();

/**
 * @swagger
 * /reports/summary:
 *   get:
 *     tags: [Reports]
 *     summary: Balance total e ingresos/gastos del mes actual
 *     responses:
 *       200:
 *         description: Resumen financiero del mes
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalBalance:
 *                           type: number
 *                           description: Suma de balances de todas las cuentas activas
 *                         monthlyIncome:
 *                           type: number
 *                         monthlyExpenses:
 *                           type: number
 *                         netSavings:
 *                           type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/summary', controller.summary);

/**
 * @swagger
 * /reports/by-category:
 *   get:
 *     tags: [Reports]
 *     summary: Gastos agrupados por categoría en un rango de fechas
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-04-01T00:00:00Z"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2025-04-30T23:59:59Z"
 *     responses:
 *       200:
 *         description: Gastos por categoría
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoryId:
 *                             type: string
 *                             format: uuid
 *                           categoryName:
 *                             type: string
 *                           total:
 *                             type: number
 *                           percentage:
 *                             type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/by-category', controller.byCategory);

/**
 * @swagger
 * /reports/monthly-trend:
 *   get:
 *     tags: [Reports]
 *     summary: Ingresos vs gastos de los últimos 6 meses
 *     responses:
 *       200:
 *         description: Tendencia mensual
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2025-03"
 *                           income:
 *                             type: number
 *                           expenses:
 *                             type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/monthly-trend', controller.monthlyTrend);

/**
 * @swagger
 * /reports/account-balances:
 *   get:
 *     tags: [Reports]
 *     summary: Balance actual de cada cuenta activa
 *     responses:
 *       200:
 *         description: Balances por cuenta
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           accountId:
 *                             type: string
 *                             format: uuid
 *                           accountName:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [BANK, CASH, CREDIT_CARD, SAVINGS]
 *                           balance:
 *                             type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/account-balances', controller.accountBalances);

export default router;

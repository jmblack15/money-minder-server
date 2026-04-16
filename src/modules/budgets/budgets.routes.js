import { Router } from 'express';
import * as controller from './budgets.controller.js';
import validate from '../../middleware/validate.js';
import { createBudgetSchema, updateBudgetSchema } from './budgets.validation.js';

const router = Router();

/**
 * @swagger
 * /budgets:
 *   get:
 *     tags: [Budgets]
 *     summary: Listar presupuestos con gasto actual del período
 *     responses:
 *       200:
 *         description: Lista de presupuestos
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
 *                         allOf:
 *                           - $ref: '#/components/schemas/Budget'
 *                           - type: object
 *                             properties:
 *                               spent:
 *                                 type: number
 *                                 description: Monto gastado en el período actual
 *                               percentage:
 *                                 type: number
 *                                 description: Porcentaje consumido del presupuesto
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getBudgets);

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     tags: [Budgets]
 *     summary: Obtener detalle de un presupuesto con spending
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalle del presupuesto
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Budget'
 *                         - type: object
 *                           properties:
 *                             spent:
 *                               type: number
 *                             percentage:
 *                               type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.getBudget);

/**
 * @swagger
 * /budgets:
 *   post:
 *     tags: [Budgets]
 *     summary: Crear un presupuesto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, amount, period, startDate]
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *                 example: 500000
 *               period:
 *                 type: string
 *                 enum: [WEEKLY, MONTHLY]
 *                 example: MONTHLY
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-04-01T00:00:00Z"
 *               alertAt:
 *                 type: integer
 *                 default: 80
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Porcentaje al que se dispara la alerta
 *     responses:
 *       201:
 *         description: Presupuesto creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Budget'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', validate(createBudgetSchema), controller.createBudget);

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     tags: [Budgets]
 *     summary: Editar un presupuesto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               period:
 *                 type: string
 *                 enum: [WEEKLY, MONTHLY]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               alertAt:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Presupuesto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Budget'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', validate(updateBudgetSchema), controller.updateBudget);

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     tags: [Budgets]
 *     summary: Eliminar un presupuesto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Presupuesto eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', controller.deleteBudget);

export default router;

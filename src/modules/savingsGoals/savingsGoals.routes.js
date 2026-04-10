import { Router } from 'express';
import * as controller from './savingsGoals.controller.js';
import validate from '../../middleware/validate.js';
import { createGoalSchema, updateGoalSchema } from './savingsGoals.validation.js';

const router = Router();

/**
 * @swagger
 * /api/savings:
 *   get:
 *     tags: [Savings Goals]
 *     summary: Listar metas de ahorro con porcentaje de progreso
 *     responses:
 *       200:
 *         description: Lista de metas de ahorro
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
 *                           - $ref: '#/components/schemas/SavingsGoal'
 *                           - type: object
 *                             properties:
 *                               progressPercentage:
 *                                 type: number
 *                                 description: Porcentaje de progreso (0–100)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getGoals);

/**
 * @swagger
 * /api/savings/{id}:
 *   get:
 *     tags: [Savings Goals]
 *     summary: Obtener detalle de una meta de ahorro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalle de la meta
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SavingsGoal'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.getGoal);

/**
 * @swagger
 * /api/savings:
 *   post:
 *     tags: [Savings Goals]
 *     summary: Crear una meta de ahorro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, targetAmount]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Vacaciones en Cartagena
 *               targetAmount:
 *                 type: number
 *                 example: 3000000
 *               currentAmount:
 *                 type: number
 *                 default: 0
 *                 example: 0
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T00:00:00Z"
 *     responses:
 *       201:
 *         description: Meta creada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SavingsGoal'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', validate(createGoalSchema), controller.createGoal);

/**
 * @swagger
 * /api/savings/{id}:
 *   put:
 *     tags: [Savings Goals]
 *     summary: Editar una meta o actualizar su monto acumulado
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
 *               name:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               currentAmount:
 *                 type: number
 *                 description: Monto acumulado actual hacia la meta
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED]
 *     responses:
 *       200:
 *         description: Meta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SavingsGoal'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', validate(updateGoalSchema), controller.updateGoal);

/**
 * @swagger
 * /api/savings/{id}:
 *   delete:
 *     tags: [Savings Goals]
 *     summary: Eliminar una meta de ahorro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Meta eliminada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', controller.deleteGoal);

export default router;

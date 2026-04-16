import { Router } from 'express';
import * as controller from './accounts.controller.js';
import validate from '../../middleware/validate.js';
import { createAccountSchema, updateAccountSchema } from './accounts.validation.js';

const router = Router();

/**
 * @swagger
 * /accounts:
 *   get:
 *     tags: [Accounts]
 *     summary: Listar cuentas del usuario
 *     responses:
 *       200:
 *         description: Lista de cuentas
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
 *                         $ref: '#/components/schemas/Account'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', controller.getAccounts);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     tags: [Accounts]
 *     summary: Obtener detalle de una cuenta
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalle de la cuenta
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Account'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', controller.getAccount);

/**
 * @swagger
 * /accounts:
 *   post:
 *     tags: [Accounts]
 *     summary: Crear una cuenta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cuenta Bancolombia
 *               type:
 *                 type: string
 *                 enum: [BANK, CASH, CREDIT_CARD, SAVINGS]
 *                 example: BANK
 *               balance:
 *                 type: number
 *                 default: 0
 *                 example: 1000000
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 example: "#4CAF50"
 *     responses:
 *       201:
 *         description: Cuenta creada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Account'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', validate(createAccountSchema), controller.createAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     tags: [Accounts]
 *     summary: Editar una cuenta
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
 *                 example: Cuenta Ahorros
 *               type:
 *                 type: string
 *                 enum: [BANK, CASH, CREDIT_CARD, SAVINGS]
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 example: "#2196F3"
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cuenta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Account'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', validate(updateAccountSchema), controller.updateAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     tags: [Accounts]
 *     summary: Desactivar una cuenta (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cuenta desactivada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', controller.deleteAccount);

export default router;

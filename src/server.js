import './config/env.js'; // Validates environment variables on startup

import express from 'express';
import helmet  from 'helmet';
import cors    from 'cors';
import morgan  from 'morgan';
import rateLimit from 'express-rate-limit';

import passport       from './config/passport.js';
import errorHandler   from './middleware/errorHandler.js';
import authMiddleware from './middleware/authMiddleware.js';
import swaggerUi      from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes         from './modules/auth/auth.routes.js';
import accountsRoutes     from './modules/accounts/accounts.routes.js';
import categoriesRoutes   from './modules/categories/categories.routes.js';
import transactionsRoutes from './modules/transactions/transactions.routes.js';
import budgetsRoutes      from './modules/budgets/budgets.routes.js';
import savingsRoutes      from './modules/savingsGoals/savingsGoals.routes.js';
import reportsRoutes      from './modules/reports/reports.routes.js';

import { PORT, NODE_ENV } from './config/env.js';

const app = express();

// ── Security and global utilities ─────────────────────────────────────────────
app.use(passport.initialize());
app.use(helmet());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Money Minder API is running', timestamp: new Date() });
});

// Global rate limiting: 200 req/15min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
}));

// Strict rate limiting for auth: 20 req/15min per IP
app.use('/api/v1/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiados intentos de autenticación.' },
}));

// ── Swagger docs ───────────────────────────────────────────────────────────────
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/v1/docs.json', (_req, res) => res.json(swaggerSpec));

// ── Public routes ─────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);

// ── Protected routes (JWT guard applied once for all) ─────────────────────────
const protectedRouter = express.Router();
protectedRouter.use(authMiddleware);
protectedRouter.use('/accounts',     accountsRoutes);
protectedRouter.use('/categories',   categoriesRoutes);
protectedRouter.use('/transactions', transactionsRoutes);
protectedRouter.use('/budgets',      budgetsRoutes);
protectedRouter.use('/savings',      savingsRoutes);
protectedRouter.use('/reports',      reportsRoutes);
app.use('/api/v1', protectedRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── Global error handler (must be the last middleware) ────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Money Minder API corriendo en http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${NODE_ENV}`);
});

export default app; // for testing

require('./config/env'); // Valida variables de entorno al arrancar

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

// ── Rutas ────────────────────────────────────────────────────────────────────
const authRoutes         = require('./modules/auth/auth.routes');
const accountsRoutes     = require('./modules/accounts/accounts.routes');
const categoriesRoutes   = require('./modules/categories/categories.routes');
const transactionsRoutes = require('./modules/transactions/transactions.routes');
const budgetsRoutes      = require('./modules/budgets/budgets.routes');
const savingsRoutes      = require('./modules/savingsGoals/savingsGoals.routes');
const reportsRoutes      = require('./modules/reports/reports.routes');

const { PORT, NODE_ENV } = require('./config/env');

const app = express();

// ── Seguridad y utilidades globales ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: '*', // En producción, restringir a dominios específicos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting global: 200 req/15min por IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
}));

// Rate limiting estricto para auth: 20 req/15min por IP
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Demasiados intentos de autenticación.' },
}));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Money Minder API is running', timestamp: new Date() });
});

// ── Rutas públicas ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Rutas protegidas (requieren JWT) ─────────────────────────────────────────
app.use('/api/accounts',     authMiddleware, accountsRoutes);
app.use('/api/categories',   authMiddleware, categoriesRoutes);
app.use('/api/transactions', authMiddleware, transactionsRoutes);
app.use('/api/budgets',      authMiddleware, budgetsRoutes);
app.use('/api/savings',      authMiddleware, savingsRoutes);
app.use('/api/reports',      authMiddleware, reportsRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── Error handler global (debe ser el último middleware) ─────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Money Minder API corriendo en http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${NODE_ENV}`);
});

module.exports = app; // para testing

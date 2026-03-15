const prisma = require('../../config/prisma');

function assertOwnership(budget, userId) {
  if (!budget || budget.userId !== userId) {
    const err = new Error('Presupuesto no encontrado');
    err.statusCode = 404;
    throw err;
  }
}

/**
 * Calcula las fechas de inicio y fin del período actual del presupuesto.
 */
function getPeriodRange(period, startDate) {
  const now = new Date();
  let periodStart, periodEnd;

  if (period === 'MONTHLY') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else {
    // WEEKLY: semana que contiene hoy
    const day = now.getDay(); // 0=Dom
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // lunes
    periodStart = new Date(now.setDate(diff));
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);
    periodEnd.setHours(23, 59, 59, 999);
  }

  // No puede empezar antes que startDate del budget
  if (periodStart < startDate) periodStart = startDate;

  return { periodStart, periodEnd };
}

/**
 * Suma lo gastado en la categoría del budget durante el período actual.
 */
async function computeSpent(budget) {
  const { periodStart, periodEnd } = getPeriodRange(budget.period, budget.startDate);

  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      categoryId: budget.categoryId,
      type: 'EXPENSE',
      account: { userId: budget.userId },
      date: { gte: periodStart, lte: periodEnd },
    },
  });

  const spent = Number(result._sum.amount ?? 0);
  const budgetAmount = Number(budget.amount);
  const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

  return {
    spent,
    remaining: Math.max(0, budgetAmount - spent),
    percentage,
    isOverBudget: spent > budgetAmount,
    alertTriggered: percentage >= budget.alertAt,
    periodStart,
    periodEnd,
  };
}

async function getBudgets(userId) {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return Promise.all(
    budgets.map(async (b) => ({ ...b, spending: await computeSpent(b) }))
  );
}

async function getBudgetById(id, userId) {
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });
  assertOwnership(budget, userId);
  return { ...budget, spending: await computeSpent(budget) };
}

async function createBudget(userId, data) {
  return prisma.budget.create({
    data: { ...data, userId },
    include: { category: true },
  });
}

async function updateBudget(id, userId, data) {
  const budget = await prisma.budget.findUnique({ where: { id } });
  assertOwnership(budget, userId);
  return prisma.budget.update({ where: { id }, data, include: { category: true } });
}

async function deleteBudget(id, userId) {
  const budget = await prisma.budget.findUnique({ where: { id } });
  assertOwnership(budget, userId);
  await prisma.budget.delete({ where: { id } });
}

module.exports = { getBudgets, getBudgetById, createBudget, updateBudget, deleteBudget };

import prisma from '../../config/prisma.js';

function assertOwnership(budget, userId) {
  if (!budget || budget.userId !== userId) {
    const err = new Error('Presupuesto no encontrado');
    err.statusCode = 404;
    throw err;
  }
}

/**
 * Calculates the start and end dates of the budget's current period.
 */
function getPeriodRange(period, startDate) {
  const now = new Date();
  let periodStart, periodEnd;

  if (period === 'MONTHLY') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else {
    // WEEKLY: week containing today
    const day = now.getDay(); // 0=Sun
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    periodStart = new Date(now.setDate(diff));
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);
    periodEnd.setHours(23, 59, 59, 999);
  }

  // Cannot start before the budget's startDate
  if (periodStart < startDate) periodStart = startDate;

  return { periodStart, periodEnd };
}

/**
 * Sums spending in the budget's category during the current period.
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

export async function getBudgets(userId) {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return Promise.all(
    budgets.map(async (b) => ({ ...b, spending: await computeSpent(b) }))
  );
}

export async function getBudgetById(id, userId) {
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
  });
  assertOwnership(budget, userId);
  return { ...budget, spending: await computeSpent(budget) };
}

export async function createBudget(userId, data) {
  return prisma.budget.create({
    data: { ...data, userId },
    include: { category: true },
  });
}

export async function updateBudget(id, userId, data) {
  const budget = await prisma.budget.findUnique({ where: { id } });
  assertOwnership(budget, userId);
  return prisma.budget.update({ where: { id }, data, include: { category: true } });
}

export async function deleteBudget(id, userId) {
  const budget = await prisma.budget.findUnique({ where: { id } });
  assertOwnership(budget, userId);
  await prisma.budget.delete({ where: { id } });
}

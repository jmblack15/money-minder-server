const prisma = require('../../config/prisma');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// ─── Report functions ─────────────────────────────────────────────────────────

/**
 * Balance total de todas las cuentas + ingresos/gastos del mes actual.
 */
async function getSummary(userId) {
  const { start, end } = currentMonthRange();

  const [accounts, incomeAgg, expenseAgg] = await Promise.all([
    prisma.account.findMany({
      where: { userId, isActive: true },
      select: { balance: true },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        account: { userId },
        type: 'INCOME',
        date: { gte: start, lte: end },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        account: { userId },
        type: 'EXPENSE',
        date: { gte: start, lte: end },
      },
    }),
  ]);

  const totalBalance  = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const monthIncome   = Number(incomeAgg._sum.amount  ?? 0);
  const monthExpense  = Number(expenseAgg._sum.amount ?? 0);
  const monthNet      = monthIncome - monthExpense;

  return {
    totalBalance,
    currentMonth: {
      income:   monthIncome,
      expenses: monthExpense,
      net:      monthNet,
      from:     start,
      to:       end,
    },
  };
}

/**
 * Gastos agrupados por categoría en un rango de fechas.
 */
async function getByCategory(userId, { dateFrom, dateTo }) {
  const from = dateFrom ? new Date(dateFrom) : new Date(currentMonthRange().start);
  const to   = dateTo   ? new Date(dateTo)   : new Date(currentMonthRange().end);

  // Obtener totales por categoría
  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId'],
    _sum: { amount: true },
    _count: { id: true },
    where: {
      account: { userId },
      type: 'EXPENSE',
      date: { gte: from, lte: to },
    },
  });

  if (!grouped.length) return { categories: [], total: 0, from, to };

  // Enriquecer con datos de categoría
  const categoryIds = grouped.map((g) => g.categoryId);
  const categories  = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true, color: true },
  });
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const total = grouped.reduce((sum, g) => sum + Number(g._sum.amount ?? 0), 0);

  const result = grouped
    .map((g) => ({
      category:   catMap[g.categoryId] ?? { id: g.categoryId, name: 'Desconocida' },
      amount:     Number(g._sum.amount ?? 0),
      count:      g._count.id,
      percentage: total > 0 ? Math.round((Number(g._sum.amount ?? 0) / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return { categories: result, total, from, to };
}

/**
 * Ingresos vs gastos de los últimos 6 meses.
 */
async function getMonthlyTrend(userId) {
  const months = [];
  const now = new Date();

  // Construir rango de los últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    months.push({ label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, start, end });
  }

  const results = await Promise.all(
    months.map(async ({ label, start, end }) => {
      const [income, expense] = await Promise.all([
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { account: { userId }, type: 'INCOME', date: { gte: start, lte: end } },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { account: { userId }, type: 'EXPENSE', date: { gte: start, lte: end } },
        }),
      ]);

      const inc = Number(income._sum.amount  ?? 0);
      const exp = Number(expense._sum.amount ?? 0);

      return { month: label, income: inc, expenses: exp, net: inc - exp };
    })
  );

  return { months: results };
}

/**
 * Balance actual de cada cuenta activa del usuario.
 */
async function getAccountBalances(userId) {
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
    select: { id: true, name: true, type: true, balance: true, color: true, currency: false },
    orderBy: { name: 'asc' },
  });

  const total = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  return {
    accounts: accounts.map((a) => ({ ...a, balance: Number(a.balance) })),
    total,
  };
}

module.exports = { getSummary, getByCategory, getMonthlyTrend, getAccountBalances };

const prisma = require('../../config/prisma');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function assertOwnership(transaction, userId) {
  if (!transaction) {
    const err = new Error('Transacción no encontrada');
    err.statusCode = 404;
    throw err;
  }
  if (transaction.account.userId !== userId) {
    const err = new Error('No tienes acceso a esta transacción');
    err.statusCode = 403;
    throw err;
  }
}

/**
 * Calcula el delta de balance que produce un movimiento sobre una cuenta.
 * INCOME  → +amount en accountId
 * EXPENSE → -amount en accountId
 * TRANSFER → -amount en accountId, +amount en toAccountId
 */
function getBalanceDeltas(type, amount, accountId, toAccountId) {
  const ops = [];
  if (type === 'INCOME') {
    ops.push({ id: accountId, delta: amount });
  } else if (type === 'EXPENSE') {
    ops.push({ id: accountId, delta: -amount });
  } else if (type === 'TRANSFER') {
    ops.push({ id: accountId,   delta: -amount });
    ops.push({ id: toAccountId, delta:  amount });
  }
  return ops;
}

async function assertAccountBelongsToUser(accountId, userId) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== userId) {
    const err = new Error(`Cuenta ${accountId} no encontrada o no te pertenece`);
    err.statusCode = 404;
    throw err;
  }
  return account;
}

// ─── Service functions ────────────────────────────────────────────────────────

async function getTransactions(userId, filters) {
  const { accountId, categoryId, type, dateFrom, dateTo, limit, offset } = filters;

  const where = {
    account: { userId }, // asegura que solo vea sus transacciones
    ...(accountId  && { accountId }),
    ...(categoryId && { categoryId }),
    ...(type       && { type }),
    ...(dateFrom || dateTo
      ? { date: { ...(dateFrom && { gte: dateFrom }), ...(dateTo && { lte: dateTo }) } }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        account:  { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, limit, offset };
}

async function getTransactionById(id, userId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true, category: true },
  });
  assertOwnership(transaction, userId);
  return transaction;
}

/**
 * Crea una transacción y actualiza los balances de cuenta en una sola
 * transacción de base de datos para garantizar consistencia.
 */
async function createTransaction(userId, data) {
  const { accountId, categoryId, toAccountId, amount, type, description, date, notes } = data;

  // Validar ownership de cuentas
  await assertAccountBelongsToUser(accountId, userId);
  if (toAccountId) await assertAccountBelongsToUser(toAccountId, userId);

  const deltas = getBalanceDeltas(type, amount, accountId, toAccountId);

  return prisma.$transaction(async (tx) => {
    // Crear la transacción
    const transaction = await tx.transaction.create({
      data: { accountId, categoryId, toAccountId, amount, type, description, date, notes },
      include: { account: true, category: true },
    });

    // Actualizar balances
    for (const { id, delta } of deltas) {
      await tx.account.update({
        where: { id },
        data: { balance: { increment: delta } },
      });
    }

    return transaction;
  });
}

/**
 * Edita una transacción.
 * Revierte el efecto original en el balance y aplica el nuevo.
 */
async function updateTransaction(id, userId, data) {
  const existing = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true },
  });
  assertOwnership(existing, userId);

  // Si cambia la cuenta o to-account, validar ownership
  const newAccountId   = data.accountId   ?? existing.accountId;
  const newToAccountId = data.toAccountId ?? existing.toAccountId;
  if (data.accountId)   await assertAccountBelongsToUser(data.accountId, userId);
  if (data.toAccountId) await assertAccountBelongsToUser(data.toAccountId, userId);

  const newAmount = data.amount ?? Number(existing.amount);
  const newType   = data.type   ?? existing.type;

  // Deltas para revertir el estado actual
  const reverseDeltas = getBalanceDeltas(
    existing.type,
    Number(existing.amount),
    existing.accountId,
    existing.toAccountId
  ).map(({ id: accId, delta }) => ({ id: accId, delta: -delta }));

  // Deltas para aplicar el nuevo estado
  const forwardDeltas = getBalanceDeltas(newType, newAmount, newAccountId, newToAccountId);

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.update({
      where: { id },
      data: {
        accountId:   newAccountId,
        toAccountId: newToAccountId,
        amount:      newAmount,
        type:        newType,
        categoryId:  data.categoryId  ?? existing.categoryId,
        description: data.description ?? existing.description,
        date:        data.date        ?? existing.date,
        notes:       data.notes       ?? existing.notes,
      },
      include: { account: true, category: true },
    });

    for (const { id: accId, delta } of [...reverseDeltas, ...forwardDeltas]) {
      await tx.account.update({
        where: { id: accId },
        data: { balance: { increment: delta } },
      });
    }

    return transaction;
  });
}

/**
 * Elimina una transacción y revierte su efecto en el balance.
 */
async function deleteTransaction(id, userId) {
  const existing = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true },
  });
  assertOwnership(existing, userId);

  const reverseDeltas = getBalanceDeltas(
    existing.type,
    Number(existing.amount),
    existing.accountId,
    existing.toAccountId
  ).map(({ id: accId, delta }) => ({ id: accId, delta: -delta }));

  return prisma.$transaction(async (tx) => {
    await tx.transaction.delete({ where: { id } });

    for (const { id: accId, delta } of reverseDeltas) {
      await tx.account.update({
        where: { id: accId },
        data: { balance: { increment: delta } },
      });
    }
  });
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

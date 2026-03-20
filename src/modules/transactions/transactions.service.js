import prisma from '../../config/prisma.js';

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
 * Calculates the balance delta that a movement produces on an account.
 * INCOME  → +amount on accountId
 * EXPENSE → -amount on accountId
 * TRANSFER → -amount on accountId, +amount on toAccountId
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

export async function getTransactions(userId, filters) {
  const { accountId, categoryId, type, dateFrom, dateTo, limit, offset } = filters;

  const where = {
    account: { userId }, // ensures user only sees their transactions
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

export async function getTransactionById(id, userId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true, category: true },
  });
  assertOwnership(transaction, userId);
  return transaction;
}

/**
 * Creates a transaction and updates account balances in a single
 * database transaction to guarantee consistency.
 */
export async function createTransaction(userId, data) {
  const { accountId, categoryId, toAccountId, amount, type, description, date, notes } = data;

  // Validate account ownership
  await assertAccountBelongsToUser(accountId, userId);
  if (toAccountId) await assertAccountBelongsToUser(toAccountId, userId);

  const deltas = getBalanceDeltas(type, amount, accountId, toAccountId);

  return prisma.$transaction(async (tx) => {
    // Create the transaction
    const transaction = await tx.transaction.create({
      data: { accountId, categoryId, toAccountId, amount, type, description, date, notes },
      include: { account: true, category: true },
    });

    // Update balances
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
 * Edits a transaction.
 * Reverts the original balance effect and applies the new one.
 */
export async function updateTransaction(id, userId, data) {
  const existing = await prisma.transaction.findUnique({
    where: { id },
    include: { account: true },
  });
  assertOwnership(existing, userId);

  // If account or to-account changes, validate ownership
  const newAccountId   = data.accountId   ?? existing.accountId;
  const newToAccountId = data.toAccountId ?? existing.toAccountId;
  if (data.accountId)   await assertAccountBelongsToUser(data.accountId, userId);
  if (data.toAccountId) await assertAccountBelongsToUser(data.toAccountId, userId);

  const newAmount = data.amount ?? Number(existing.amount);
  const newType   = data.type   ?? existing.type;

  // Deltas to revert current state
  const reverseDeltas = getBalanceDeltas(
    existing.type,
    Number(existing.amount),
    existing.accountId,
    existing.toAccountId
  ).map(({ id: accId, delta }) => ({ id: accId, delta: -delta }));

  // Deltas to apply new state
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
 * Deletes a transaction and reverts its balance effect.
 */
export async function deleteTransaction(id, userId) {
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

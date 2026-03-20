import prisma from '../../config/prisma.js';

function assertOwnership(account, userId) {
  if (!account || account.userId !== userId) {
    const err = new Error('Cuenta no encontrada');
    err.statusCode = 404;
    throw err;
  }
}

export async function getAccounts(userId) {
  return prisma.account.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getAccountById(id, userId) {
  const account = await prisma.account.findUnique({ where: { id } });
  assertOwnership(account, userId);
  return account;
}

export async function createAccount(userId, data) {
  return prisma.account.create({
    data: { ...data, userId, balance: data.balance ?? 0 },
  });
}

export async function updateAccount(id, userId, data) {
  const account = await prisma.account.findUnique({ where: { id } });
  assertOwnership(account, userId);

  return prisma.account.update({ where: { id }, data });
}

export async function deleteAccount(id, userId) {
  const account = await prisma.account.findUnique({ where: { id } });
  assertOwnership(account, userId);

  // Soft delete: mark as inactive
  return prisma.account.update({
    where: { id },
    data: { isActive: false },
  });
}

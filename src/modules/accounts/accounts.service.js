const prisma = require('../../config/prisma');

function assertOwnership(account, userId) {
  if (!account || account.userId !== userId) {
    const err = new Error('Cuenta no encontrada');
    err.statusCode = 404;
    throw err;
  }
}

async function getAccounts(userId) {
  return prisma.account.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
  });
}

async function getAccountById(id, userId) {
  const account = await prisma.account.findUnique({ where: { id } });
  assertOwnership(account, userId);
  return account;
}

async function createAccount(userId, data) {
  return prisma.account.create({
    data: { ...data, userId, balance: data.balance ?? 0 },
  });
}

async function updateAccount(id, userId, data) {
  const account = await prisma.account.findUnique({ where: { id } });
  assertOwnership(account, userId);

  return prisma.account.update({ where: { id }, data });
}

async function deleteAccount(id, userId) {
  const account = await prisma.account.findUnique({ where: { id } });
  assertOwnership(account, userId);

  // Soft delete: marcar como inactiva
  return prisma.account.update({
    where: { id },
    data: { isActive: false },
  });
}

module.exports = { getAccounts, getAccountById, createAccount, updateAccount, deleteAccount };

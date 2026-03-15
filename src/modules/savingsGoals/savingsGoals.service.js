const prisma = require('../../config/prisma');

function assertOwnership(goal, userId) {
  if (!goal || goal.userId !== userId) {
    const err = new Error('Meta de ahorro no encontrada');
    err.statusCode = 404;
    throw err;
  }
}

function addProgress(goal) {
  const target  = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return { ...goal, progressPercent: progress };
}

async function getGoals(userId) {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return goals.map(addProgress);
}

async function getGoalById(id, userId) {
  const goal = await prisma.savingsGoal.findUnique({ where: { id } });
  assertOwnership(goal, userId);
  return addProgress(goal);
}

async function createGoal(userId, data) {
  const goal = await prisma.savingsGoal.create({ data: { ...data, userId } });
  return addProgress(goal);
}

async function updateGoal(id, userId, data) {
  const goal = await prisma.savingsGoal.findUnique({ where: { id } });
  assertOwnership(goal, userId);

  // Si current_amount alcanza target_amount, marcar como COMPLETED automáticamente
  const newCurrent = data.currentAmount ?? Number(goal.currentAmount);
  const newTarget  = data.targetAmount  ?? Number(goal.targetAmount);
  const autoStatus = newCurrent >= newTarget ? 'COMPLETED' : undefined;

  const updated = await prisma.savingsGoal.update({
    where: { id },
    data: {
      ...data,
      ...(autoStatus && { status: autoStatus }),
    },
  });

  return addProgress(updated);
}

async function deleteGoal(id, userId) {
  const goal = await prisma.savingsGoal.findUnique({ where: { id } });
  assertOwnership(goal, userId);
  await prisma.savingsGoal.delete({ where: { id } });
}

module.exports = { getGoals, getGoalById, createGoal, updateGoal, deleteGoal };

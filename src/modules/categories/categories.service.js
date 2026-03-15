const prisma = require('../../config/prisma');

function assertUserOwnership(category, userId) {
  if (!category) {
    const err = new Error('Categoría no encontrada');
    err.statusCode = 404;
    throw err;
  }
  if (category.userId !== userId) {
    const err = new Error('No tienes permiso para modificar esta categoría');
    err.statusCode = 403;
    throw err;
  }
}

async function getCategories(userId) {
  // Retorna categorías globales (userId = null) + las del usuario
  return prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ userId: 'asc' }, { name: 'asc' }],
  });
}

async function createCategory(userId, data) {
  return prisma.category.create({ data: { ...data, userId } });
}

async function updateCategory(id, userId, data) {
  const category = await prisma.category.findUnique({ where: { id } });
  assertUserOwnership(category, userId);
  return prisma.category.update({ where: { id }, data });
}

async function deleteCategory(id, userId) {
  const category = await prisma.category.findUnique({ where: { id } });
  assertUserOwnership(category, userId);
  await prisma.category.delete({ where: { id } });
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

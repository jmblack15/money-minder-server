const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const globalCategories = [
  // ── Gastos ───────────────────────────────────────────────────────────────
  { name: 'Alimentación',    icon: '🍔', type: 'EXPENSE', color: '#FF6B6B' },
  { name: 'Transporte',      icon: '🚌', type: 'EXPENSE', color: '#4ECDC4' },
  { name: 'Vivienda',        icon: '🏠', type: 'EXPENSE', color: '#45B7D1' },
  { name: 'Salud',           icon: '💊', type: 'EXPENSE', color: '#96CEB4' },
  { name: 'Entretenimiento', icon: '🎬', type: 'EXPENSE', color: '#FFEAA7' },
  { name: 'Ropa',            icon: '👕', type: 'EXPENSE', color: '#DDA0DD' },
  { name: 'Educación',       icon: '📚', type: 'EXPENSE', color: '#98D8C8' },
  { name: 'Servicios',       icon: '💡', type: 'EXPENSE', color: '#F7DC6F' },
  // ── Ingresos ─────────────────────────────────────────────────────────────
  { name: 'Salario',         icon: '💼', type: 'INCOME', color: '#2ECC71' },
  { name: 'Freelance',       icon: '💻', type: 'INCOME', color: '#27AE60' },
  { name: 'Inversiones',     icon: '📈', type: 'INCOME', color: '#1ABC9C' },
  { name: 'Otros ingresos',  icon: '💰', type: 'INCOME', color: '#16A085' },
];

async function main() {
  console.log('🌱 Seeding global categories...');

  // upsert para poder re-ejecutar sin duplicar
  for (const cat of globalCategories) {
    await prisma.category.upsert({
      where: {
        // No existe unique constraint combinado en el schema para esto,
        // así que buscamos manualmente y creamos sólo si no existe.
        // Como workaround usamos un campo dummy; el upsert real se hace abajo.
        id: `global-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: { name: cat.name, icon: cat.icon, color: cat.color },
      create: {
        id: `global-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: cat.name,
        icon: cat.icon,
        type: cat.type,
        color: cat.color,
        userId: null, // categoría global
      },
    });
  }

  console.log(`✅ ${globalCategories.length} global categories seeded.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

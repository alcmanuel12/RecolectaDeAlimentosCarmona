// Pasa a minúsculas los emails ya guardados (el login ahora normaliza a minúsculas).
// Aborta sin cambios si dos emails chocarían al normalizarse.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const recolectores = await prisma.recolector.findMany({ select: { id: true, email: true } });
  const cambios = recolectores
    .map((r) => ({ id: r.id, actual: r.email, nuevo: r.email.trim().toLowerCase() }))
    .filter((c) => c.actual !== c.nuevo);

  const finales = new Map();
  for (const r of recolectores) {
    const email = r.email.trim().toLowerCase();
    if (finales.has(email)) {
      throw new Error(`Conflicto: los recolectores ${finales.get(email)} y ${r.id} comparten el email "${email}".`);
    }
    finales.set(email, r.id);
  }

  for (const c of cambios) {
    await prisma.recolector.update({ where: { id: c.id }, data: { email: c.nuevo } });
    console.log(`#${c.id}: ${c.actual} -> ${c.nuevo}`);
  }
  console.log(`${cambios.length} email(s) normalizado(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

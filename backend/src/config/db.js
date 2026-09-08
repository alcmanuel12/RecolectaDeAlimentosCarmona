const { PrismaClient } = require('@prisma/client');

// Instancia única de Prisma compartida por toda la app.
const prisma = new PrismaClient();

module.exports = prisma;

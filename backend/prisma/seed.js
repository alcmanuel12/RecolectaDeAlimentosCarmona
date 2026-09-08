require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PRODUCTOS = [
  { nombre: 'Leche 1L', categoria: 'no_perecedero', precio: 0.95 },
  { nombre: 'Aceite de oliva 1L', categoria: 'no_perecedero', precio: 4.5 },
  { nombre: 'Arroz 1kg', categoria: 'no_perecedero', precio: 1.2 },
  { nombre: 'Pasta 500g', categoria: 'no_perecedero', precio: 0.85 },
  { nombre: 'Legumbres (bote) 400g', categoria: 'no_perecedero', precio: 1.1 },
  { nombre: 'Conservas de atún (pack 3)', categoria: 'no_perecedero', precio: 2.7 },
  { nombre: 'Leche infantil 800g', categoria: 'bebe', precio: 12.5 },
  { nombre: 'Potitos (pack 6)', categoria: 'bebe', precio: 5.4 },
  { nombre: 'Pañales talla 4 (pack 40)', categoria: 'bebe', precio: 9.9 },
  { nombre: 'Toallitas húmedas', categoria: 'bebe', precio: 2.3 },
  { nombre: 'Compresas (pack 20)', categoria: 'higiene_femenina', precio: 2.5 },
  { nombre: 'Tampones (pack 16)', categoria: 'higiene_femenina', precio: 3.1 },
  { nombre: 'Gel de ducha', categoria: 'otros', precio: 2.0 },
  { nombre: 'Champú', categoria: 'otros', precio: 2.4 },
  { nombre: 'Pasta de dientes', categoria: 'otros', precio: 1.5 },
  { nombre: 'Papel higiénico (pack 12)', categoria: 'otros', precio: 4.8 },
];

async function main() {
  console.log('Sembrando catálogo de productos...');
  for (const p of PRODUCTOS) {
    const existente = await prisma.producto.findFirst({ where: { nombre: p.nombre } });
    if (!existente) {
      await prisma.producto.create({ data: p });
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hermandad.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'CambiaEstaClave123!';

  const adminExistente = await prisma.recolector.findUnique({ where: { email: adminEmail } });
  if (!adminExistente) {
    console.log(`Creando usuario administrador (${adminEmail})...`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.recolector.create({
      data: {
        nombre: 'Admin',
        apellidos: 'Hermandad',
        email: adminEmail,
        dniUltimosDigitos: '0000A',
        hermandad: 'Hermandad Ejemplo',
        zonaTexto: 'Sede central',
        passwordHash,
        rol: 'admin',
      },
    });
  } else {
    console.log('El usuario administrador ya existe, se omite.');
  }

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

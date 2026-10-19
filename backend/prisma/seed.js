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

  // Usuarios del entorno de pruebas. Si ya existen, se restablece su
  // contraseña, rol y estado para que el entorno quede siempre igual.
  const usuarios = [
    {
      email: (process.env.ADMIN_EMAIL || 'admin@admin.com').trim().toLowerCase(),
      password: process.env.ADMIN_PASSWORD || '12345678',
      nombre: 'Admin',
      apellidos: 'Hermandad',
      rol: 'admin',
    },
    {
      email: (process.env.RECOLECTOR_EMAIL || 'usuario@usuario.com').trim().toLowerCase(),
      password: process.env.RECOLECTOR_PASSWORD || '12345678',
      nombre: 'Usuario',
      apellidos: 'Recolector',
      rol: 'recolector',
    },
  ];

  for (const u of usuarios) {
    console.log(`Creando/actualizando usuario ${u.rol} (${u.email})...`);
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.recolector.upsert({
      where: { email: u.email },
      update: { passwordHash, rol: u.rol, activo: true },
      create: {
        nombre: u.nombre,
        apellidos: u.apellidos,
        email: u.email,
        dniUltimosDigitos: '0000A',
        hermandad: 'Hermandad Ejemplo',
        zonaTexto: 'Sede central',
        passwordHash,
        rol: u.rol,
      },
    });
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

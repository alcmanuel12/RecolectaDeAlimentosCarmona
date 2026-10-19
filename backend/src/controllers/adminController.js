const bcrypt = require('bcryptjs');
const { Parser } = require('json2csv');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

function serializar(recolector) {
  const { passwordHash, ...resto } = recolector;
  return resto;
}

// Evita CSV Formula Injection: si un valor de texto proveniente de un
// usuario (nombre de donante, hermandad, zona, etc.) empieza por un carácter
// que Excel/Sheets interpreta como inicio de fórmula, se antepone un
// apóstrofo para neutralizarlo al abrir el fichero.
function sanearCeldaCsv(valor) {
  if (typeof valor !== 'string') return valor;
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
}

// GET /api/admin/recolectores
const listarRecolectores = asyncHandler(async (req, res) => {
  const recolectores = await prisma.recolector.findMany({ orderBy: { fechaAlta: 'desc' } });
  res.json({ recolectores: recolectores.map(serializar) });
});

// POST /api/admin/recolectores - alta de recolector (o admin) por parte de la hermandad
const crearRecolector = asyncHandler(async (req, res) => {
  const { nombre, apellidos, email, password, dniUltimosDigitos, hermandad, zonaTexto, rol } = req.body;

  if (!nombre || !apellidos || !email || !password || !dniUltimosDigitos || !hermandad || !zonaTexto) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const existente = await prisma.recolector.findUnique({ where: { email } });
  if (existente) return res.status(409).json({ error: 'Ya existe un recolector con ese email.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const recolector = await prisma.recolector.create({
    data: {
      nombre,
      apellidos,
      email,
      dniUltimosDigitos,
      hermandad,
      zonaTexto,
      passwordHash,
      rol: rol === 'admin' ? 'admin' : 'recolector',
    },
  });
  res.status(201).json({ recolector: serializar(recolector) });
});

// PUT /api/admin/recolectores/:id
const actualizarRecolector = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, apellidos, hermandad, zonaTexto, activo, rol, password } = req.body;

  const data = { nombre, apellidos, hermandad, zonaTexto, activo, rol };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const recolector = await prisma.recolector.update({ where: { id }, data });
  res.json({ recolector: serializar(recolector) });
});

// DELETE /api/admin/recolectores/:id - baja lógica (desactivar), no se borra el histórico
const bajaRecolector = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const recolector = await prisma.recolector.update({ where: { id }, data: { activo: false } });
  res.json({ recolector: serializar(recolector) });
});

// GET /api/admin/export/donaciones?desde=&hasta=&hermandad=&zona=
const exportarDonacionesCsv = asyncHandler(async (req, res) => {
  const { desde, hasta, hermandad, zona } = req.query;

  const where = {};
  if (desde || hasta) {
    where.fecha = {};
    if (desde) where.fecha.gte = new Date(desde);
    if (hasta) where.fecha.lte = new Date(hasta);
  }
  if (hermandad || zona) {
    where.recolector = {};
    if (hermandad) where.recolector.hermandad = hermandad;
    if (zona) where.recolector.zonaTexto = zona;
  }

  const donaciones = await prisma.donacion.findMany({
    where,
    include: {
      recolector: { select: { nombre: true, apellidos: true, hermandad: true, zonaTexto: true } },
      lineas: { include: { producto: true } },
    },
    orderBy: { fecha: 'desc' },
  });

  const filas = donaciones.map((d) => ({
    id: d.id,
    fecha: d.fecha.toISOString(),
    recolector: sanearCeldaCsv(`${d.recolector.nombre} ${d.recolector.apellidos}`),
    hermandad: sanearCeldaCsv(d.recolector.hermandad),
    zona: sanearCeldaCsv(d.recolector.zonaTexto),
    metodoPago: d.metodoPago,
    importeTotal: d.importeTotal,
    nombreDonante: sanearCeldaCsv(d.nombreDonante || ''),
    emailDonante: sanearCeldaCsv(d.emailDonante || ''),
    productos: sanearCeldaCsv(d.lineas.map((l) => `${l.cantidad}x ${l.producto.nombre}`).join('; ')),
  }));

  const parser = new Parser({
    fields: ['id', 'fecha', 'recolector', 'hermandad', 'zona', 'metodoPago', 'importeTotal', 'nombreDonante', 'emailDonante', 'productos'],
  });
  const csv = filas.length ? parser.parse(filas) : parser.parse([]);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="donaciones.csv"');
  res.send(csv);
});

module.exports = { listarRecolectores, crearRecolector, actualizarRecolector, bajaRecolector, exportarDonacionesCsv };

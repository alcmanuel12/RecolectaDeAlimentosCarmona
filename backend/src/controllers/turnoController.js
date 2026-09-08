const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/turnos/activo - turno abierto del recolector autenticado (o null)
const obtenerActivo = asyncHandler(async (req, res) => {
  const turno = await prisma.turnoRecogida.findFirst({
    where: { recolectorId: req.usuario.id, cerrado: false },
    orderBy: { fechaInicio: 'desc' },
  });
  res.json({ turno });
});

// POST /api/turnos - abre un turno nuevo. Falla si ya hay uno abierto.
const abrir = asyncHandler(async (req, res) => {
  const existente = await prisma.turnoRecogida.findFirst({
    where: { recolectorId: req.usuario.id, cerrado: false },
  });
  if (existente) {
    return res.status(409).json({ error: 'Ya tienes un turno abierto.', turno: existente });
  }

  const turno = await prisma.turnoRecogida.create({
    data: { recolectorId: req.usuario.id },
  });
  res.status(201).json({ turno });
});

// GET /api/turnos/:id - detalle de un turno (dueño o admin)
const obtener = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const turno = await prisma.turnoRecogida.findUnique({
    where: { id },
    include: { donaciones: { include: { lineas: { include: { producto: true } } } }, recolector: true },
  });
  if (!turno) return res.status(404).json({ error: 'Turno no encontrado.' });
  if (turno.recolectorId !== req.usuario.id && req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para ver este turno.' });
  }
  res.json({ turno });
});

// POST /api/turnos/:id/cerrar - cierra el turno, contrastando el efectivo entregado
const cerrar = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { totalEfectivoEntregado, notasCierre } = req.body;

  const turno = await prisma.turnoRecogida.findUnique({ where: { id } });
  if (!turno) return res.status(404).json({ error: 'Turno no encontrado.' });
  if (turno.recolectorId !== req.usuario.id && req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para cerrar este turno.' });
  }
  if (turno.cerrado) {
    return res.status(409).json({ error: 'Este turno ya está cerrado.' });
  }
  if (typeof totalEfectivoEntregado !== 'number' || totalEfectivoEntregado < 0) {
    return res.status(400).json({ error: 'totalEfectivoEntregado es obligatorio y debe ser un número >= 0.' });
  }

  const descuadre = Math.abs(totalEfectivoEntregado - turno.totalEfectivoEsperado) > 0.01;
  if (descuadre && !notasCierre) {
    return res.status(400).json({
      error: 'El efectivo entregado no coincide con el esperado. Añade una nota explicativa (notasCierre).',
      totalEfectivoEsperado: turno.totalEfectivoEsperado,
    });
  }

  const turnoActualizado = await prisma.turnoRecogida.update({
    where: { id },
    data: {
      fechaFin: new Date(),
      cerrado: true,
      totalEfectivoEntregado,
      notasCierre: notasCierre || null,
    },
  });

  res.json({ turno: turnoActualizado });
});

// GET /api/turnos - listado (admin), con filtros opcionales
const listar = asyncHandler(async (req, res) => {
  const { cerrado, recolectorId } = req.query;
  const where = {};
  if (cerrado !== undefined) where.cerrado = cerrado === 'true';
  if (recolectorId) where.recolectorId = Number(recolectorId);

  const turnos = await prisma.turnoRecogida.findMany({
    where,
    include: { recolector: { select: { id: true, nombre: true, apellidos: true, hermandad: true, zonaTexto: true } } },
    orderBy: { fechaInicio: 'desc' },
  });
  res.json({ turnos });
});

module.exports = { obtenerActivo, abrir, obtener, cerrar, listar };

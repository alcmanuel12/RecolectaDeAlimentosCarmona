const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { CATEGORIAS_PRODUCTO } = require('../utils/enums');
const { parsearId } = require('../utils/validacion');

// GET /api/productos  (recolector autenticado, para el catálogo del carrito; solo activos por defecto)
const listar = asyncHandler(async (req, res) => {
  const incluirInactivos = req.query.todos === 'true' && req.usuario?.rol === 'admin';
  const productos = await prisma.producto.findMany({
    where: incluirInactivos ? {} : { activo: true },
    orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
  });
  res.json({ productos });
});

// POST /api/productos  (admin)
const crear = asyncHandler(async (req, res) => {
  const { nombre, categoria, precio } = req.body;
  if (!nombre || !categoria || precio === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, categoria, precio).' });
  }
  if (!CATEGORIAS_PRODUCTO.includes(categoria)) {
    return res.status(400).json({ error: `Categoría inválida. Debe ser una de: ${CATEGORIAS_PRODUCTO.join(', ')}` });
  }
  if (typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0) {
    return res.status(400).json({ error: 'El precio debe ser un número mayor o igual que 0.' });
  }

  const producto = await prisma.producto.create({ data: { nombre, categoria, precio } });
  res.status(201).json({ producto });
});

// PUT /api/productos/:id  (admin)
const actualizar = asyncHandler(async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id de producto inválido.' });
  const { nombre, categoria, precio, activo } = req.body;

  if (categoria !== undefined && !CATEGORIAS_PRODUCTO.includes(categoria)) {
    return res.status(400).json({ error: `Categoría inválida. Debe ser una de: ${CATEGORIAS_PRODUCTO.join(', ')}` });
  }
  if (precio !== undefined && (typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0)) {
    return res.status(400).json({ error: 'El precio debe ser un número mayor o igual que 0.' });
  }

  const producto = await prisma.producto.update({
    where: { id },
    data: { nombre, categoria, precio, activo },
  });
  res.json({ producto });
});

// DELETE /api/productos/:id  (admin) - baja lógica, no se borra físicamente
const baja = asyncHandler(async (req, res) => {
  const id = parsearId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Id de producto inválido.' });
  const producto = await prisma.producto.update({ where: { id }, data: { activo: false } });
  res.json({ producto });
});

module.exports = { listar, crear, actualizar, baja };

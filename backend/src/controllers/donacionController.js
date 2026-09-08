const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { METODOS_PAGO } = require('../utils/enums');
const { enviarAgradecimiento } = require('../services/emailService');

// POST /api/donaciones
// body: { turnoId, metodoPago, lineas: [{ productoId, cantidad }], importeRecibidoEfectivo?,
//         confirmacionDatafono?, nombreDonante?, emailDonante? }
const crear = asyncHandler(async (req, res) => {
  const {
    turnoId,
    metodoPago,
    lineas,
    importeRecibidoEfectivo,
    confirmacionDatafono,
    nombreDonante,
    emailDonante,
  } = req.body;

  if (!turnoId || !metodoPago || !Array.isArray(lineas) || lineas.length === 0) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (turnoId, metodoPago, lineas).' });
  }
  if (!METODOS_PAGO.includes(metodoPago)) {
    return res.status(400).json({ error: `metodoPago inválido. Debe ser una de: ${METODOS_PAGO.join(', ')}` });
  }

  const turno = await prisma.turnoRecogida.findUnique({ where: { id: Number(turnoId) } });
  if (!turno) return res.status(404).json({ error: 'Turno no encontrado.' });
  if (turno.recolectorId !== req.usuario.id) {
    return res.status(403).json({ error: 'No puedes registrar donaciones en un turno que no es tuyo.' });
  }
  if (turno.cerrado) {
    return res.status(409).json({ error: 'El turno ya está cerrado.' });
  }

  // Cargar productos y calcular el importe con el precio actual (snapshot).
  const productoIds = lineas.map((l) => Number(l.productoId));
  const productos = await prisma.producto.findMany({ where: { id: { in: productoIds } } });
  const productosPorId = new Map(productos.map((p) => [p.id, p]));

  let importeTotal = 0;
  const lineasParaCrear = [];
  for (const linea of lineas) {
    const producto = productosPorId.get(Number(linea.productoId));
    const cantidad = Number(linea.cantidad);
    if (!producto) {
      return res.status(400).json({ error: `Producto ${linea.productoId} no encontrado.` });
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res.status(400).json({ error: `Cantidad inválida para el producto ${producto.nombre}.` });
    }
    const precioUnitario = producto.precio;
    importeTotal += precioUnitario * cantidad;
    lineasParaCrear.push({ productoId: producto.id, cantidad, precioUnitario });
  }
  importeTotal = Math.round(importeTotal * 100) / 100;

  // Validaciones específicas por método de pago.
  if (metodoPago === 'tarjeta' && !confirmacionDatafono) {
    return res.status(400).json({
      error: 'Debes confirmar que el datáfono ha aprobado la operación (confirmacionDatafono).',
    });
  }
  if (metodoPago === 'efectivo' && typeof importeRecibidoEfectivo !== 'number') {
    return res.status(400).json({ error: 'importeRecibidoEfectivo es obligatorio para donaciones en efectivo.' });
  }

  const donacion = await prisma.$transaction(async (tx) => {
    const nueva = await tx.donacion.create({
      data: {
        recolectorId: req.usuario.id,
        turnoId: turno.id,
        metodoPago,
        importeTotal,
        importeRecibidoEfectivo: metodoPago === 'efectivo' ? importeRecibidoEfectivo : null,
        confirmacionDatafono: metodoPago === 'tarjeta' ? Boolean(confirmacionDatafono) : false,
        nombreDonante: nombreDonante || null,
        emailDonante: emailDonante || null,
        lineas: { create: lineasParaCrear },
      },
      include: { lineas: { include: { producto: true } } },
    });

    // Mantener los totales del turno al día (columnas "calculadas").
    await tx.turnoRecogida.update({
      where: { id: turno.id },
      data: {
        totalEfectivoEsperado:
          metodoPago === 'efectivo' ? { increment: importeTotal } : undefined,
        totalTarjeta: metodoPago === 'tarjeta' ? { increment: importeTotal } : undefined,
      },
    });

    return nueva;
  });

  res.status(201).json({ donacion });

  // Correo de agradecimiento: async, no bloquea la respuesta ya enviada.
  if (emailDonante) {
    enviarAgradecimiento({
      email: emailDonante,
      nombre: nombreDonante,
      importeTotal: donacion.importeTotal,
      lineas: donacion.lineas,
    })
      .then((resultado) => {
        if (resultado.enviado) {
          prisma.donacion
            .update({ where: { id: donacion.id }, data: { emailAgradecimientoEnviado: true } })
            .catch((err) => console.error('[donacionController] Error marcando email enviado:', err.message));
        }
      })
      .catch((err) => console.error('[donacionController] Error enviando agradecimiento:', err.message));
  }
});

// GET /api/donaciones/:id
const obtener = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const donacion = await prisma.donacion.findUnique({
    where: { id },
    include: { lineas: { include: { producto: true } } },
  });
  if (!donacion) return res.status(404).json({ error: 'Donación no encontrada.' });
  if (donacion.recolectorId !== req.usuario.id && req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para ver esta donación.' });
  }
  res.json({ donacion });
});

// GET /api/donaciones?turnoId=  - listado de donaciones de un turno (dueño o admin)
const listarPorTurno = asyncHandler(async (req, res) => {
  const { turnoId } = req.query;
  if (!turnoId) return res.status(400).json({ error: 'turnoId es obligatorio.' });

  const turno = await prisma.turnoRecogida.findUnique({ where: { id: Number(turnoId) } });
  if (!turno) return res.status(404).json({ error: 'Turno no encontrado.' });
  if (turno.recolectorId !== req.usuario.id && req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para ver estas donaciones.' });
  }

  const donaciones = await prisma.donacion.findMany({
    where: { turnoId: Number(turnoId) },
    include: { lineas: { include: { producto: true } } },
    orderBy: { fecha: 'desc' },
  });
  res.json({ donaciones });
});

module.exports = { crear, obtener, listarPorTurno };

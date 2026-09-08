const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/publico/transparencia
// Totales agregados, sin ningún dato personal de donantes ni recolectores.
const transparencia = asyncHandler(async (req, res) => {
  const [agregadoGeneral, donaciones] = await Promise.all([
    prisma.donacion.aggregate({ _sum: { importeTotal: true }, _count: { id: true } }),
    prisma.donacion.findMany({
      select: {
        importeTotal: true,
        recolector: { select: { hermandad: true, zonaTexto: true } },
        lineas: { select: { cantidad: true, precioUnitario: true, producto: { select: { categoria: true } } } },
      },
    }),
  ]);

  const porHermandad = {};
  const porZona = {};
  const porCategoria = {};

  for (const d of donaciones) {
    const hermandad = d.recolector.hermandad;
    const zona = d.recolector.zonaTexto;

    porHermandad[hermandad] = porHermandad[hermandad] || { hermandad, total: 0, numDonaciones: 0 };
    porHermandad[hermandad].total += d.importeTotal;
    porHermandad[hermandad].numDonaciones += 1;

    porZona[zona] = porZona[zona] || { zona, total: 0, numDonaciones: 0 };
    porZona[zona].total += d.importeTotal;
    porZona[zona].numDonaciones += 1;

    for (const linea of d.lineas) {
      const cat = linea.producto.categoria;
      porCategoria[cat] = porCategoria[cat] || { categoria: cat, total: 0, unidades: 0 };
      porCategoria[cat].total += linea.cantidad * linea.precioUnitario;
      porCategoria[cat].unidades += linea.cantidad;
    }
  }

  const redondear = (n) => Math.round(n * 100) / 100;

  res.json({
    totalRecaudado: redondear(agregadoGeneral._sum.importeTotal || 0),
    numeroDonaciones: agregadoGeneral._count.id,
    porHermandad: Object.values(porHermandad).map((h) => ({ ...h, total: redondear(h.total) })),
    porZona: Object.values(porZona).map((z) => ({ ...z, total: redondear(z.total) })),
    porCategoria: Object.values(porCategoria).map((c) => ({ ...c, total: redondear(c.total) })),
  });
});

module.exports = { transparencia };

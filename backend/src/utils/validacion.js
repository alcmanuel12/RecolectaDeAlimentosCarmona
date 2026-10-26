// Utilidades de validación de entrada compartidas por los controladores.

// Devuelve un entero positivo o null si el valor no lo es.
function parsearId(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Devuelve un Date válido o null.
function parsearFecha(valor) {
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

const EMAIL_RE = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

function esEmailValido(valor) {
  return typeof valor === 'string' && valor.length <= 254 && EMAIL_RE.test(valor);
}

module.exports = { parsearId, parsearFecha, esEmailValido };

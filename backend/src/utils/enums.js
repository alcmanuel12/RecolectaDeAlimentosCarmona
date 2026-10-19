// Los "enum" del modelo de datos se guardan como String y se validan aquí a
// nivel de aplicación.

const CATEGORIAS_PRODUCTO = ['bebe', 'higiene_femenina', 'no_perecedero', 'otros'];

const METODOS_PAGO = ['tarjeta', 'efectivo'];

const ROLES = ['recolector', 'admin'];

module.exports = { CATEGORIAS_PRODUCTO, METODOS_PAGO, ROLES };

const ETIQUETAS_CATEGORIA = {
  bebe: 'Bebé',
  higiene_femenina: 'Higiene femenina',
  no_perecedero: 'No perecedero',
  otros: 'Otros',
};

export default function ProductCard({ producto, cantidad, onCambiarCantidad }) {
  const seleccionado = cantidad > 0;

  return (
    <div className={`price-row ${seleccionado ? 'price-row-seleccionada' : ''}`}>
      <div className="price-row-info">
        <div className="price-row-nombre">{producto.nombre}</div>
        <div className="price-row-precio">{producto.precio.toFixed(2)} €</div>
      </div>
      <div className="price-row-controles">
        <button
          type="button"
          className="btn btn-square"
          onClick={() => onCambiarCantidad(producto, Math.max(0, cantidad - 1))}
          disabled={cantidad === 0}
          aria-label={`Quitar una unidad de ${producto.nombre}`}
        >
          −
        </button>
        <span className={`price-row-cantidad ${seleccionado ? '' : 'price-row-cantidad-cero'}`}>{cantidad}</span>
        <button
          type="button"
          className="btn btn-square btn-square-add"
          onClick={() => onCambiarCantidad(producto, cantidad + 1)}
          aria-label={`Añadir una unidad de ${producto.nombre}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export { ETIQUETAS_CATEGORIA };

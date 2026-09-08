const ETIQUETAS_CATEGORIA = {
  bebe: '👶 Bebé',
  higiene_femenina: '🌸 Higiene femenina',
  no_perecedero: '🥫 No perecedero',
  otros: '🧴 Otros',
};

export default function ProductCard({ producto, cantidad, onCambiarCantidad }) {
  return (
    <div className="product-card">
      <div className="product-card-info">
        <span className="product-card-nombre">{producto.nombre}</span>
        <span className="product-card-precio">{producto.precio.toFixed(2)} €</span>
      </div>
      <div className="product-card-controles">
        <button
          type="button"
          className="btn btn-square"
          onClick={() => onCambiarCantidad(producto, Math.max(0, cantidad - 1))}
          disabled={cantidad === 0}
          aria-label={`Quitar una unidad de ${producto.nombre}`}
        >
          −
        </button>
        <span className="product-card-cantidad">{cantidad}</span>
        <button
          type="button"
          className="btn btn-square"
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

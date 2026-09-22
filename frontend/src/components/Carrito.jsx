import { ICONOS_CATEGORIA } from './ProductCard';

export default function Carrito({ lineas, total, onQuitar }) {
  if (lineas.length === 0) {
    return <p className="carrito-vacio">Todavía no has añadido ningún producto.</p>;
  }

  return (
    <div className="carrito">
      <div className="carrito-tarjetas">
        {lineas.map(({ producto, cantidad }) => (
          <div key={producto.id} className="carrito-tarjeta">
            <span className="carrito-tarjeta-icono" aria-hidden="true">
              {ICONOS_CATEGORIA[producto.categoria] || '🛒'}
            </span>
            <div className="carrito-tarjeta-info">
              <span className="carrito-tarjeta-nombre">{producto.nombre}</span>
              <span className="carrito-tarjeta-detalle">
                {cantidad} × {producto.precio.toFixed(2)} €
              </span>
            </div>
            <span className="carrito-tarjeta-subtotal">{(producto.precio * cantidad).toFixed(2)} €</span>
            {onQuitar && (
              <button
                type="button"
                className="carrito-tarjeta-quitar"
                onClick={() => onQuitar(producto)}
                aria-label={`Quitar ${producto.nombre} del carrito`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="carrito-total">
        <span>Total</span>
        <strong>{total.toFixed(2)} €</strong>
      </div>
    </div>
  );
}

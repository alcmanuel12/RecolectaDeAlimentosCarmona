export default function Carrito({ lineas, total }) {
  if (lineas.length === 0) {
    return <p className="carrito-vacio">Todavía no has añadido ningún producto.</p>;
  }

  return (
    <div className="carrito">
      <ul className="carrito-lista">
        {lineas.map(({ producto, cantidad }) => (
          <li key={producto.id} className="carrito-linea">
            <span>
              {cantidad} × {producto.nombre}
            </span>
            <span>{(producto.precio * cantidad).toFixed(2)} €</span>
          </li>
        ))}
      </ul>
      <div className="carrito-total">
        <span>Total</span>
        <strong>{total.toFixed(2)} €</strong>
      </div>
    </div>
  );
}

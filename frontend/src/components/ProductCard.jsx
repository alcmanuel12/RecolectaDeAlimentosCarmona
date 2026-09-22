import { useEffect, useRef, useState } from 'react';

const ETIQUETAS_CATEGORIA = {
  bebe: 'Bebé',
  higiene_femenina: 'Higiene femenina',
  no_perecedero: 'No perecedero',
  otros: 'Otros',
};

const ICONOS_CATEGORIA = {
  bebe: '👶',
  higiene_femenina: '🌸',
  no_perecedero: '🥫',
  otros: '🧴',
};

export default function ProductCard({ producto, cantidad, onCambiarCantidad }) {
  const [pulso, setPulso] = useState(false);
  const esPrimerRender = useRef(true);

  useEffect(() => {
    if (esPrimerRender.current) {
      esPrimerRender.current = false;
      return;
    }
    setPulso(true);
    const timeout = setTimeout(() => setPulso(false), 220);
    return () => clearTimeout(timeout);
  }, [cantidad]);

  const seleccionado = cantidad > 0;

  function anadirUnidad() {
    onCambiarCantidad(producto, cantidad + 1);
  }

  function quitarUnidad(e) {
    e.stopPropagation();
    onCambiarCantidad(producto, Math.max(0, cantidad - 1));
  }

  function alPulsarTecla(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      anadirUnidad();
    }
  }

  return (
    <div
      className={`product-card ${seleccionado ? 'product-card-seleccionada' : ''}`}
      role="button"
      tabIndex={0}
      onClick={anadirUnidad}
      onKeyDown={alPulsarTecla}
      aria-label={`Añadir una unidad de ${producto.nombre}`}
    >
      {seleccionado && <span className="product-card-check">✓</span>}
      <div className="product-card-icono" aria-hidden="true">
        {ICONOS_CATEGORIA[producto.categoria] || '🛒'}
      </div>
      <div className="product-card-info">
        <span className="product-card-nombre">{producto.nombre}</span>
        <span className="product-card-precio">{producto.precio.toFixed(2)} €</span>
      </div>
      <div className="product-card-controles">
        <button
          type="button"
          className="btn btn-square"
          onClick={quitarUnidad}
          onKeyDown={(e) => e.stopPropagation()}
          disabled={cantidad === 0}
          aria-label={`Quitar una unidad de ${producto.nombre}`}
        >
          −
        </button>
        <span className={`product-card-cantidad ${pulso ? 'pulso' : ''}`}>{cantidad}</span>
      </div>
    </div>
  );
}

export { ETIQUETAS_CATEGORIA, ICONOS_CATEGORIA };

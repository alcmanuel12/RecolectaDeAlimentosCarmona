import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarProductos } from '../api/productos';
import { obtenerTurnoActivo } from '../api/turnos';
import { crearDonacion } from '../api/donaciones';
import { extraerError } from '../api/client';
import ProductCard, { ETIQUETAS_CATEGORIA, ICONOS_CATEGORIA } from '../components/ProductCard';
import Carrito from '../components/Carrito';

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export default function CarritoDonacion() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [turno, setTurno] = useState(null);
  const [cantidades, setCantidades] = useState({}); // productoId -> cantidad
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [nombreDonante, setNombreDonante] = useState('');
  const [emailDonante, setEmailDonante] = useState('');
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [confirmacionDatafono, setConfirmacionDatafono] = useState(false);
  const [importeRecibidoEfectivo, setImporteRecibidoEfectivo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const [listaProductos, turnoActivo] = await Promise.all([listarProductos(), obtenerTurnoActivo()]);
        setProductos(listaProductos);
        setTurno(turnoActivo);
        if (!turnoActivo) {
          setError('No tienes ningún turno abierto. Vuelve al panel y abre un turno primero.');
        }
      } catch (err) {
        setError(extraerError(err, 'No se ha podido cargar el catálogo.'));
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const lineasCarrito = useMemo(() => {
    return productos
      .filter((p) => cantidades[p.id] > 0)
      .map((p) => ({ producto: p, cantidad: cantidades[p.id] }));
  }, [productos, cantidades]);

  const total = useMemo(
    () => lineasCarrito.reduce((suma, l) => suma + l.producto.precio * l.cantidad, 0),
    [lineasCarrito]
  );

  const numeroArticulos = useMemo(
    () => lineasCarrito.reduce((suma, l) => suma + l.cantidad, 0),
    [lineasCarrito]
  );

  const categoriasDisponibles = useMemo(() => {
    const set = new Set(productos.map((p) => p.categoria));
    return Array.from(set);
  }, [productos]);

  const unidadesPorCategoria = useMemo(() => {
    const mapa = {};
    for (const p of productos) {
      const cantidad = cantidades[p.id] || 0;
      if (cantidad > 0) mapa[p.categoria] = (mapa[p.categoria] || 0) + cantidad;
    }
    return mapa;
  }, [productos, cantidades]);

  const productosFiltrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return productos.filter((p) => {
      if (categoriaActiva !== 'todos' && p.categoria !== categoriaActiva) return false;
      if (termino && !normalizar(p.nombre).includes(termino)) return false;
      return true;
    });
  }, [productos, categoriaActiva, busqueda]);

  const productosPorCategoria = useMemo(() => {
    const grupos = {};
    for (const p of productosFiltrados) {
      grupos[p.categoria] = grupos[p.categoria] || [];
      grupos[p.categoria].push(p);
    }
    return grupos;
  }, [productosFiltrados]);

  function cambiarCantidad(producto, nuevaCantidad) {
    setCantidades((c) => ({ ...c, [producto.id]: nuevaCantidad }));
  }

  function irAlResumen() {
    document.getElementById('resumen')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validarAntesDeEnviar() {
    if (!turno) return 'No tienes un turno abierto.';
    if (lineasCarrito.length === 0) return 'Añade al menos un producto al carrito.';
    if (metodoPago === 'tarjeta' && !confirmacionDatafono) {
      return 'Confirma que el datáfono ha aprobado la operación.';
    }
    if (metodoPago === 'efectivo' && importeRecibidoEfectivo === '') {
      return 'Indica el importe recibido en efectivo.';
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validacion = validarAntesDeEnviar();
    if (validacion) {
      setError(validacion);
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await crearDonacion({
        turnoId: turno.id,
        metodoPago,
        confirmacionDatafono: metodoPago === 'tarjeta' ? confirmacionDatafono : undefined,
        importeRecibidoEfectivo: metodoPago === 'efectivo' ? Number(importeRecibidoEfectivo) : undefined,
        nombreDonante: nombreDonante || undefined,
        emailDonante: emailDonante || undefined,
        lineas: lineasCarrito.map((l) => ({ productoId: l.producto.id, cantidad: l.cantidad })),
      });
      navigate('/', { state: { donacionRegistrada: true } });
    } catch (err) {
      setError(extraerError(err, 'No se ha podido registrar la donación.'));
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <div className="page-loading">Cargando…</div>;

  return (
    <div className="page carrito-page">
      <h1>Nueva donación</h1>
      {error && <p className="form-error">{error}</p>}

      {turno && (
        <>
          <div className="carrito-layout">
            <div className="catalogo">
              <div className="catalogo-controles">
                <input
                  type="search"
                  className="catalogo-buscador"
                  placeholder="Buscar producto…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  aria-label="Buscar producto"
                />
                <div className="categoria-pills">
                  <button
                    type="button"
                    className={`categoria-pill ${categoriaActiva === 'todos' ? 'categoria-pill-activa' : ''}`}
                    onClick={() => setCategoriaActiva('todos')}
                  >
                    Todos
                  </button>
                  {categoriasDisponibles.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`categoria-pill ${categoriaActiva === cat ? 'categoria-pill-activa' : ''}`}
                      onClick={() => setCategoriaActiva(cat)}
                    >
                      <span aria-hidden="true">{ICONOS_CATEGORIA[cat]}</span> {ETIQUETAS_CATEGORIA[cat] || cat}
                      {unidadesPorCategoria[cat] > 0 && (
                        <span className="categoria-pill-badge">{unidadesPorCategoria[cat]}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {Object.keys(productosPorCategoria).length === 0 && (
                <p className="carrito-vacio">No se han encontrado productos con ese filtro.</p>
              )}

              {Object.entries(productosPorCategoria).map(([categoria, lista]) => (
                <section key={categoria} className="categoria-section">
                  <h2>
                    <span aria-hidden="true">{ICONOS_CATEGORIA[categoria]}</span>{' '}
                    {ETIQUETAS_CATEGORIA[categoria] || categoria}
                  </h2>
                  <div className="product-grid">
                    {lista.map((p) => (
                      <ProductCard
                        key={p.id}
                        producto={p}
                        cantidad={cantidades[p.id] || 0}
                        onCambiarCantidad={cambiarCantidad}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <form id="resumen" className="resumen-donacion" onSubmit={handleSubmit}>
              <h2>Resumen</h2>
              <Carrito lineas={lineasCarrito} total={total} onQuitar={(producto) => cambiarCantidad(producto, 0)} />

              <label>
                Nombre del donante (opcional)
                <input value={nombreDonante} onChange={(e) => setNombreDonante(e.target.value)} />
              </label>
              <label>
                Email del donante (opcional, para el correo de agradecimiento)
                <input type="email" value={emailDonante} onChange={(e) => setEmailDonante(e.target.value)} />
              </label>

              <fieldset className="metodo-pago">
                <legend>Método de pago</legend>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="tarjeta"
                    checked={metodoPago === 'tarjeta'}
                    onChange={() => setMetodoPago('tarjeta')}
                  />
                  Tarjeta (datáfono físico)
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="metodoPago"
                    value="efectivo"
                    checked={metodoPago === 'efectivo'}
                    onChange={() => setMetodoPago('efectivo')}
                  />
                  Efectivo
                </label>
              </fieldset>

              {metodoPago === 'tarjeta' && (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={confirmacionDatafono}
                    onChange={(e) => setConfirmacionDatafono(e.target.checked)}
                  />
                  Confirmo que el datáfono ha aprobado la operación
                </label>
              )}

              {metodoPago === 'efectivo' && (
                <label>
                  Importe recibido en efectivo (€)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={importeRecibidoEfectivo}
                    onChange={(e) => setImporteRecibidoEfectivo(e.target.value)}
                  />
                </label>
              )}

              <button className="btn btn-primary" type="submit" disabled={enviando || lineasCarrito.length === 0}>
                {enviando ? 'Registrando…' : `Confirmar donación (${total.toFixed(2)} €)`}
              </button>
            </form>
          </div>

          {numeroArticulos > 0 && (
            <button type="button" className="mobile-cart-bar" onClick={irAlResumen}>
              <span>
                {numeroArticulos} artículo{numeroArticulos !== 1 ? 's' : ''}
              </span>
              <strong>{total.toFixed(2)} €</strong>
              <span className="mobile-cart-bar-cta">Ver resumen ↓</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}

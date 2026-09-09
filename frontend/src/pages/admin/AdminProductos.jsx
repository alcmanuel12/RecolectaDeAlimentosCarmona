import { useEffect, useState } from 'react';
import { listarTodosProductos, crearProducto, actualizarProducto, darDeBajaProducto } from '../../api/productos';
import { extraerError } from '../../api/client';
import { ETIQUETAS_CATEGORIA } from '../../components/ProductCard';

const FORM_INICIAL = { nombre: '', categoria: 'no_perecedero', precio: '' };

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      setProductos(await listarTodosProductos());
    } catch (err) {
      setError(extraerError(err));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function handleChange(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  async function handleCrear(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await crearProducto({ ...form, precio: Number(form.precio) });
      setForm(FORM_INICIAL);
      setMostrarForm(false);
      await cargar();
    } catch (err) {
      setError(extraerError(err));
    } finally {
      setEnviando(false);
    }
  }

  async function handlePrecio(producto, nuevoPrecio) {
    const valor = Number(nuevoPrecio);
    if (Number.isNaN(valor) || valor < 0) return;
    try {
      await actualizarProducto(producto.id, { precio: valor });
      await cargar();
    } catch (err) {
      setError(extraerError(err));
    }
  }

  async function handleToggleActivo(producto) {
    try {
      if (producto.activo) {
        await darDeBajaProducto(producto.id);
      } else {
        await actualizarProducto(producto.id, { activo: true });
      }
      await cargar();
    } catch (err) {
      setError(extraerError(err));
    }
  }

  if (cargando) return <p>Cargando…</p>;

  return (
    <div>
      <div className="button-row">
        <button className="btn btn-primary" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form form-inline" onSubmit={handleCrear}>
          <label>
            Nombre
            <input value={form.nombre} onChange={handleChange('nombre')} required />
          </label>
          <label>
            Categoría
            <select value={form.categoria} onChange={handleChange('categoria')}>
              {Object.entries(ETIQUETAS_CATEGORIA).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>
          <label>
            Precio (€)
            <input type="number" step="0.01" min="0" value={form.precio} onChange={handleChange('precio')} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      )}

      {error && <p className="form-error">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{ETIQUETAS_CATEGORIA[p.categoria] || p.categoria}</td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={p.precio}
                  className="input-precio"
                  onBlur={(e) => handlePrecio(p, e.target.value)}
                />
                {' €'}
              </td>
              <td>
                <span className={`tag ${p.activo ? 'tag-accent' : 'tag-neutral'}`}>{p.activo ? 'Activo' : 'Baja'}</span>
              </td>
              <td className="table-acciones">
                <button className="btn btn-link" onClick={() => handleToggleActivo(p)}>
                  {p.activo ? 'Dar de baja' : 'Reactivar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

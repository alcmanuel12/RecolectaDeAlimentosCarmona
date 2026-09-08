import { useEffect, useState } from 'react';
import { obtenerTransparencia } from '../api/publico';
import { extraerError } from '../api/client';
import { ETIQUETAS_CATEGORIA } from '../components/ProductCard';

export default function Transparencia() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerTransparencia()
      .then(setDatos)
      .catch((err) => setError(extraerError(err, 'No se han podido cargar los datos.')))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="page-loading">Cargando…</div>;
  if (error) return <div className="page"><p className="form-error">{error}</p></div>;

  return (
    <div className="page">
      <h1>Panel de transparencia</h1>
      <p className="page-subtitle">
        Totales agregados de todas las donaciones registradas. No se muestra ningún dato personal
        de donantes ni de recolectores.
      </p>

      <div className="stat-row">
        <div className="stat stat-large">
          <span className="stat-label">Total recaudado</span>
          <span className="stat-value">{datos.totalRecaudado.toFixed(2)} €</span>
        </div>
        <div className="stat stat-large">
          <span className="stat-label">Nº de donaciones</span>
          <span className="stat-value">{datos.numeroDonaciones}</span>
        </div>
      </div>

      <div className="transparencia-grid">
        <section>
          <h2>Por hermandad</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Hermandad</th>
                <th>Total</th>
                <th>Donaciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.porHermandad.map((h) => (
                <tr key={h.hermandad}>
                  <td>{h.hermandad}</td>
                  <td>{h.total.toFixed(2)} €</td>
                  <td>{h.numDonaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Por zona</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Zona</th>
                <th>Total</th>
                <th>Donaciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.porZona.map((z) => (
                <tr key={z.zona}>
                  <td>{z.zona}</td>
                  <td>{z.total.toFixed(2)} €</td>
                  <td>{z.numDonaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Por categoría de producto</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Total</th>
                <th>Unidades</th>
              </tr>
            </thead>
            <tbody>
              {datos.porCategoria.map((c) => (
                <tr key={c.categoria}>
                  <td>{ETIQUETAS_CATEGORIA[c.categoria] || c.categoria}</td>
                  <td>{c.total.toFixed(2)} €</td>
                  <td>{c.unidades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

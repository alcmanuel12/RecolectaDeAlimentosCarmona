import { useEffect, useState } from 'react';
import { obtenerTransparencia } from '../api/publico';
import { extraerError } from '../api/client';
import { ETIQUETAS_CATEGORIA } from '../components/ProductCard';

const FORMATO_EUROS = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const euros = (n) => `${FORMATO_EUROS.format(n)} €`;

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

  const porHermandadOrdenado = [...datos.porHermandad].sort((a, b) => b.total - a.total);
  const maxHermandad = porHermandadOrdenado[0]?.total || 1;

  return (
    <div className="page transparencia-page">
      <div className="dateline">
        <span>Recogida Solidaria · Consejo de Hermandades y Cofradías de Carmona</span>
      </div>
      <h1 className="transparencia-title">Cuentas de la campaña, al día</h1>
      <p className="page-subtitle" style={{ maxWidth: '58ch' }}>
        Totales agregados de todas las donaciones registradas. Ningún dato personal de donantes ni
        de recolectores se muestra aquí.
      </p>

      <div className="transparencia-figures">
        <div>
          <span className="stat-label">Recaudado</span>
          <div className="landing-figure">{euros(datos.totalRecaudado)}</div>
        </div>
        <div>
          <span className="stat-label">Donaciones</span>
          <div className="landing-figure">{datos.numeroDonaciones.toLocaleString('es-ES')}</div>
        </div>
      </div>

      <h2 style={{ marginTop: 40 }}>Por hermandad</h2>
      <div className="ranking-list">
        {porHermandadOrdenado.map((h, i) => (
          <div key={h.hermandad} className="ranking-row">
            <div className="ranking-row-head">
              <span>{i + 1} · {h.hermandad}</span>
              <span>{euros(h.total)}</span>
            </div>
            <div className="ledger-bar">
              <div style={{ width: `${Math.round((h.total / maxHermandad) * 100)}%`, background: 'var(--color-text)' }} />
            </div>
            <div className="ranking-row-meta">{h.numDonaciones} donaciones</div>
          </div>
        ))}
      </div>
      <p className="text-muted" style={{ fontSize: 12 }}>
        La clasificación es informativa. Todo lo recaudado va al mismo destino: las organizaciones
        que compran y reparten.
      </p>

      <div className="transparencia-tables">
        <section>
          <h2>Por zona</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Zona</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Donaciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.porZona.map((z) => (
                <tr key={z.zona}>
                  <td>{z.zona}</td>
                  <td style={{ textAlign: 'right' }}>{euros(z.total)}</td>
                  <td style={{ textAlign: 'right' }}>{z.numDonaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Comprado con ese dinero</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Unidades</th>
                <th style={{ textAlign: 'right' }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {datos.porCategoria.map((c) => (
                <tr key={c.categoria}>
                  <td>{ETIQUETAS_CATEGORIA[c.categoria] || c.categoria}</td>
                  <td style={{ textAlign: 'right' }}>{c.unidades}</td>
                  <td style={{ textAlign: 'right' }}>{euros(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

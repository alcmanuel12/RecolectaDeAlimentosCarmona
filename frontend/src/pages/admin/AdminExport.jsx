import { useState } from 'react';
import { exportarDonacionesCsv } from '../../api/admin';
import { extraerError } from '../../api/client';

export default function AdminExport() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [hermandad, setHermandad] = useState('');
  const [zona, setZona] = useState('');
  const [error, setError] = useState('');
  const [exportando, setExportando] = useState(false);

  async function handleExportar() {
    setError('');
    setExportando(true);
    try {
      const filtros = {};
      if (desde) filtros.desde = desde;
      if (hasta) filtros.hasta = hasta;
      if (hermandad) filtros.hermandad = hermandad;
      if (zona) filtros.zona = zona;
      await exportarDonacionesCsv(filtros);
    } catch (err) {
      setError(extraerError(err, 'No se ha podido generar la exportación.'));
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="form form-inline">
      <label>
        Desde
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
      </label>
      <label>
        Hasta
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </label>
      <label>
        Hermandad
        <input value={hermandad} onChange={(e) => setHermandad(e.target.value)} placeholder="(todas)" />
      </label>
      <label>
        Zona
        <input value={zona} onChange={(e) => setZona(e.target.value)} placeholder="(todas)" />
      </label>
      <button className="btn btn-primary" onClick={handleExportar} disabled={exportando}>
        {exportando ? 'Generando…' : 'Exportar CSV'}
      </button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

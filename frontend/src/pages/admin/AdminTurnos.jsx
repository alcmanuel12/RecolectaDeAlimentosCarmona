import { useEffect, useState } from 'react';
import { listarTurnos } from '../../api/turnos';
import { extraerError } from '../../api/client';

export default function AdminTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const filtros = filtro === 'todos' ? {} : { cerrado: filtro === 'cerrados' ? 'true' : 'false' };
        setTurnos(await listarTurnos(filtros));
      } catch (err) {
        setError(extraerError(err));
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [filtro]);

  return (
    <div>
      <div className="button-row">
        <label>
          Mostrar:{' '}
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="abiertos">Abiertos</option>
            <option value="cerrados">Cerrados</option>
          </select>
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Recolector</th>
              <th>Hermandad / Zona</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Efectivo esp. / entreg.</th>
              <th>Tarjeta</th>
              <th>Estado</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id}>
                <td>
                  {t.recolector.nombre} {t.recolector.apellidos}
                </td>
                <td>
                  {t.recolector.hermandad} / {t.recolector.zonaTexto}
                </td>
                <td>{new Date(t.fechaInicio).toLocaleString()}</td>
                <td>{t.fechaFin ? new Date(t.fechaFin).toLocaleString() : '—'}</td>
                <td>
                  {t.totalEfectivoEsperado.toFixed(2)} € /{' '}
                  {t.totalEfectivoEntregado !== null ? `${t.totalEfectivoEntregado.toFixed(2)} €` : '—'}
                </td>
                <td>{t.totalTarjeta.toFixed(2)} €</td>
                <td>{t.cerrado ? 'Cerrado' : 'Abierto'}</td>
                <td>{t.notasCierre || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

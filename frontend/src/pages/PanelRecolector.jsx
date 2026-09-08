import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { obtenerTurnoActivo, abrirTurno } from '../api/turnos';
import { listarDonacionesPorTurno } from '../api/donaciones';
import { extraerError } from '../api/client';

export default function PanelRecolector() {
  const [turno, setTurno] = useState(null);
  const [donaciones, setDonaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [abriendo, setAbriendo] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const turnoActivo = await obtenerTurnoActivo();
      setTurno(turnoActivo);
      if (turnoActivo) {
        const lista = await listarDonacionesPorTurno(turnoActivo.id);
        setDonaciones(lista);
      } else {
        setDonaciones([]);
      }
    } catch (err) {
      setError(extraerError(err, 'No se ha podido cargar tu turno.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function handleAbrirTurno() {
    setAbriendo(true);
    setError('');
    try {
      const nuevoTurno = await abrirTurno();
      setTurno(nuevoTurno);
      setDonaciones([]);
    } catch (err) {
      setError(extraerError(err, 'No se ha podido abrir el turno.'));
    } finally {
      setAbriendo(false);
    }
  }

  if (cargando) return <div className="page-loading">Cargando…</div>;

  return (
    <div className="page">
      <h1>Mi turno de recogida</h1>
      {error && <p className="form-error">{error}</p>}

      {!turno && (
        <div className="card">
          <p>No tienes ningún turno abierto ahora mismo.</p>
          <button className="btn btn-primary" onClick={handleAbrirTurno} disabled={abriendo}>
            {abriendo ? 'Abriendo…' : 'Abrir turno'}
          </button>
        </div>
      )}

      {turno && (
        <>
          <div className="card">
            <p>
              Turno abierto desde <strong>{new Date(turno.fechaInicio).toLocaleString()}</strong>
            </p>
            <div className="stat-row">
              <div className="stat">
                <span className="stat-label">Efectivo esperado</span>
                <span className="stat-value">{turno.totalEfectivoEsperado.toFixed(2)} €</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total tarjeta</span>
                <span className="stat-value">{turno.totalTarjeta.toFixed(2)} €</span>
              </div>
              <div className="stat">
                <span className="stat-label">Donaciones</span>
                <span className="stat-value">{donaciones.length}</span>
              </div>
            </div>
            <div className="button-row">
              <Link className="btn btn-primary" to="/carrito">
                + Nueva donación
              </Link>
              <Link className="btn btn-secondary" to="/cierre-turno">
                Cerrar turno
              </Link>
            </div>
          </div>

          <h2>Donaciones de este turno</h2>
          {donaciones.length === 0 ? (
            <p>Todavía no has registrado ninguna donación en este turno.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Método</th>
                  <th>Importe</th>
                  <th>Productos</th>
                </tr>
              </thead>
              <tbody>
                {donaciones.map((d) => (
                  <tr key={d.id}>
                    <td>{new Date(d.fecha).toLocaleTimeString()}</td>
                    <td>{d.metodoPago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}</td>
                    <td>{d.importeTotal.toFixed(2)} €</td>
                    <td>{d.lineas.map((l) => `${l.cantidad}x ${l.producto.nombre}`).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

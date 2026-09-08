import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerTurnoActivo, cerrarTurno } from '../api/turnos';
import { extraerError } from '../api/client';

export default function CierreTurno() {
  const navigate = useNavigate();
  const [turno, setTurno] = useState(null);
  const [totalEfectivoEntregado, setTotalEfectivoEntregado] = useState('');
  const [notasCierre, setNotasCierre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [requiereNota, setRequiereNota] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const turnoActivo = await obtenerTurnoActivo();
        setTurno(turnoActivo);
        if (turnoActivo) setTotalEfectivoEntregado(turnoActivo.totalEfectivoEsperado.toFixed(2));
      } catch (err) {
        setError(extraerError(err, 'No se ha podido cargar el turno.'));
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await cerrarTurno(turno.id, {
        totalEfectivoEntregado: Number(totalEfectivoEntregado),
        notasCierre: notasCierre || undefined,
      });
      navigate('/');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.totalEfectivoEsperado !== undefined) {
        setRequiereNota(true);
        setError(err.response.data.error);
      } else {
        setError(extraerError(err, 'No se ha podido cerrar el turno.'));
      }
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <div className="page-loading">Cargando…</div>;
  if (!turno) {
    return (
      <div className="page page-narrow">
        <h1>Cerrar turno</h1>
        <p>No tienes ningún turno abierto.</p>
      </div>
    );
  }

  const diferencia = Number(totalEfectivoEntregado || 0) - turno.totalEfectivoEsperado;

  return (
    <div className="page page-narrow">
      <h1>Cerrar turno</h1>
      <div className="card">
        <div className="stat-row">
          <div className="stat">
            <span className="stat-label">Efectivo esperado</span>
            <span className="stat-value">{turno.totalEfectivoEsperado.toFixed(2)} €</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total tarjeta</span>
            <span className="stat-value">{turno.totalTarjeta.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Efectivo que entregas físicamente (€)
          <input
            type="number"
            step="0.01"
            min="0"
            value={totalEfectivoEntregado}
            onChange={(e) => {
              setTotalEfectivoEntregado(e.target.value);
              setRequiereNota(false);
            }}
            required
          />
        </label>

        {Math.abs(diferencia) > 0.01 && (
          <p className="form-warning">
            Diferencia de {diferencia > 0 ? '+' : ''}
            {diferencia.toFixed(2)} € respecto al esperado.
          </p>
        )}

        {(requiereNota || Math.abs(diferencia) > 0.01) && (
          <label>
            Nota explicativa del descuadre
            <textarea value={notasCierre} onChange={(e) => setNotasCierre(e.target.value)} rows={3} />
          </label>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={enviando}>
          {enviando ? 'Cerrando…' : 'Cerrar turno'}
        </button>
      </form>
    </div>
  );
}

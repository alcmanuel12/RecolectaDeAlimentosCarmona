import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { obtenerTurnoActivo, abrirTurno } from '../api/turnos';
import { listarDonacionesPorTurno } from '../api/donaciones';
import { extraerError } from '../api/client';
import { useAuth } from '../context/AuthContext';

const FORMATO_EUROS = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const euros = (n) => `${FORMATO_EUROS.format(n)} €`;

export default function PanelRecolector() {
  const { recolector } = useAuth();
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

  if (!turno) {
    return (
      <div className="page page-narrow">
        <h1>Hola, {recolector?.nombre}</h1>
        <p className="page-subtitle">No tienes ningún turno abierto.</p>
        {error && <p className="form-error">{error}</p>}
        <div className="card" style={{ marginTop: 18 }}>
          <p style={{ margin: 0 }}>Abre un turno para empezar a registrar donaciones sobre el terreno.</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleAbrirTurno} disabled={abriendo}>
            {abriendo ? 'Abriendo…' : 'Abrir turno'}
          </button>
        </div>
      </div>
    );
  }

  const total = turno.totalEfectivoEsperado + turno.totalTarjeta;
  const pctEfectivo = total > 0 ? Math.round((turno.totalEfectivoEsperado / total) * 100) : 0;
  const pctTarjeta = total > 0 ? 100 - pctEfectivo : 0;
  const horaInicio = new Date(turno.fechaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const fechaInicio = new Date(turno.fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  return (
    <div className="page page-narrow ledger-page">
      <div className="rule-thick" />
      <div className="dateline">
        <span>{recolector?.nombre} · {recolector?.hermandad}</span>
        <span>{fechaInicio}</span>
      </div>

      {error && <p className="form-error" style={{ marginTop: 14 }}>{error}</p>}

      <div className="ledger-total">{euros(total)}</div>
      <p className="ledger-caption">
        recaudado en este turno · {donaciones.length} donacion{donaciones.length === 1 ? '' : 'es'} · abierto
        desde las {horaInicio}
      </p>

      <div className="ledger-split">
        <div className="ledger-split-row">
          <span>Efectivo en caja</span>
          <strong>{euros(turno.totalEfectivoEsperado)}</strong>
        </div>
        <div className="ledger-bar"><div style={{ width: `${pctEfectivo}%`, background: 'var(--color-text)' }} /></div>
        <div className="ledger-split-row" style={{ marginTop: 14 }}>
          <span>Tarjeta (datáfono)</span>
          <strong>{euros(turno.totalTarjeta)}</strong>
        </div>
        <div className="ledger-bar"><div style={{ width: `${pctTarjeta}%`, background: 'var(--color-accent)' }} /></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
        <Link className="btn btn-primary btn-block" to="/carrito">Registrar donación</Link>
        <Link className="btn btn-secondary btn-block" to="/cierre-turno">Cerrar turno y arquear</Link>
      </div>

      <h2 style={{ marginTop: 32 }}>Asientos del turno</h2>
      {donaciones.length === 0 ? (
        <p className="text-muted">Todavía no has registrado ninguna donación en este turno.</p>
      ) : (
        <div className="ledger-entries">
          {donaciones.map((d) => (
            <div key={d.id} className="ledger-entry">
              <div>
                <div className="ledger-entry-title">
                  {new Date(d.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                  {d.metodoPago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
                </div>
                <div className="ledger-entry-lines">
                  {d.lineas.map((l) => `${l.cantidad}× ${l.producto.nombre}`).join(' · ')}
                </div>
              </div>
              <div className="ledger-entry-amount">{euros(d.importeTotal)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

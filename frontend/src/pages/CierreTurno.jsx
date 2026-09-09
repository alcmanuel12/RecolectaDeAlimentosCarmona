import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerTurnoActivo, cerrarTurno } from '../api/turnos';
import { extraerError } from '../api/client';

const DENOMINACIONES_BILLETES = [50, 20, 10, 5];

export default function CierreTurno() {
  const navigate = useNavigate();
  const [turno, setTurno] = useState(null);
  const [conteoBilletes, setConteoBilletes] = useState({});
  const [monedas, setMonedas] = useState('');
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
      } catch (err) {
        setError(extraerError(err, 'No se ha podido cargar el turno.'));
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const totalEfectivoEntregado = useMemo(() => {
    const deBilletes = DENOMINACIONES_BILLETES.reduce(
      (suma, valor) => suma + valor * (Number(conteoBilletes[valor]) || 0),
      0
    );
    const deMonedas = Number(monedas) || 0;
    return deBilletes + deMonedas;
  }, [conteoBilletes, monedas]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await cerrarTurno(turno.id, {
        totalEfectivoEntregado,
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

  const diferencia = totalEfectivoEntregado - turno.totalEfectivoEsperado;
  const hayDescuadre = Math.abs(diferencia) > 0.01;

  return (
    <div className="page page-narrow">
      <h1>Cerrar turno</h1>
      <p className="page-subtitle" style={{ marginTop: -8 }}>
        Cuenta el efectivo por billetes y monedas. El total contado se compara con lo esperado.
      </p>

      <form className="form" onSubmit={handleSubmit} style={{ marginTop: 22 }}>
        <div className="denom-list">
          {DENOMINACIONES_BILLETES.map((valor) => {
            const cantidad = Number(conteoBilletes[valor]) || 0;
            return (
              <div key={valor} className="denom-row">
                <span className="denom-label">{valor} €</span>
                <input
                  className="input denom-input"
                  type="number"
                  min="0"
                  step="1"
                  value={conteoBilletes[valor] ?? ''}
                  onChange={(e) => {
                    setConteoBilletes((c) => ({ ...c, [valor]: e.target.value }));
                    setRequiereNota(false);
                  }}
                />
                <span className="denom-subtotal">{(valor * cantidad).toFixed(2)} €</span>
              </div>
            );
          })}
          <div className="denom-row denom-row-monedas">
            <span className="denom-label">Monedas</span>
            <input
              className="input denom-input"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={monedas}
              onChange={(e) => {
                setMonedas(e.target.value);
                setRequiereNota(false);
              }}
            />
            <span className="denom-subtotal">{(Number(monedas) || 0).toFixed(2)} €</span>
          </div>
        </div>

        <div className="stat-row" style={{ marginTop: 8 }}>
          <div className="stat">
            <span className="stat-label">Esperado</span>
            <span className="stat-value" style={{ fontSize: 24 }}>{turno.totalEfectivoEsperado.toFixed(2)} €</span>
          </div>
          <div className="stat">
            <span className="stat-label">Contado</span>
            <span className="stat-value" style={{ fontSize: 24 }}>{totalEfectivoEntregado.toFixed(2)} €</span>
          </div>
        </div>

        {hayDescuadre && (
          <div className="descuadre-box">
            <div className="descuadre-box-head">
              <span>Descuadre</span>
              <span>{diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)} €</span>
            </div>
            <p>Un descuadre exige nota explicativa antes de cerrar.</p>
          </div>
        )}

        {(requiereNota || hayDescuadre) && (
          <div className="field">
            <label htmlFor="nota">Nota del descuadre</label>
            <textarea className="input" id="nota" rows={3} value={notasCierre} onChange={(e) => setNotasCierre(e.target.value)} />
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={enviando}>
          {enviando ? 'Cerrando…' : 'Firmar y cerrar turno'}
        </button>
        <p className="text-muted" style={{ fontSize: 11.5, marginTop: -6 }}>
          Tarjeta del turno: {turno.totalTarjeta.toFixed(2)} € · se conciliará con el extracto del datáfono.
        </p>
      </form>
    </div>
  );
}

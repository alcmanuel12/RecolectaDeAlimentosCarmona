import { useEffect, useState } from 'react';
import { listarRecolectores, crearRecolector, actualizarRecolector, bajaRecolector } from '../../api/admin';
import { extraerError } from '../../api/client';

const FORM_INICIAL = {
  nombre: '',
  apellidos: '',
  email: '',
  password: '',
  dniUltimosDigitos: '',
  hermandad: '',
  zonaTexto: '',
  rol: 'recolector',
};

export default function AdminRecolectores() {
  const [recolectores, setRecolectores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      setRecolectores(await listarRecolectores());
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
      await crearRecolector(form);
      setForm(FORM_INICIAL);
      setMostrarForm(false);
      await cargar();
    } catch (err) {
      setError(extraerError(err));
    } finally {
      setEnviando(false);
    }
  }

  async function handleToggleActivo(recolector) {
    try {
      if (recolector.activo) {
        await bajaRecolector(recolector.id);
      } else {
        await actualizarRecolector(recolector.id, { activo: true });
      }
      await cargar();
    } catch (err) {
      setError(extraerError(err));
    }
  }

  async function handleCambiarRol(recolector) {
    const nuevoRol = recolector.rol === 'admin' ? 'recolector' : 'admin';
    try {
      await actualizarRecolector(recolector.id, { rol: nuevoRol });
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
          {mostrarForm ? 'Cancelar' : '+ Nuevo recolector'}
        </button>
      </div>

      {mostrarForm && (
        <form className="form form-inline" onSubmit={handleCrear}>
          <label>
            Nombre
            <input value={form.nombre} onChange={handleChange('nombre')} required />
          </label>
          <label>
            Apellidos
            <input value={form.apellidos} onChange={handleChange('apellidos')} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={handleChange('email')} required />
          </label>
          <label>
            Contraseña
            <input type="password" minLength={8} value={form.password} onChange={handleChange('password')} required />
          </label>
          <label>
            Últimos dígitos del DNI
            <input
              value={form.dniUltimosDigitos}
              onChange={handleChange('dniUltimosDigitos')}
              placeholder="p. ej. 1234A"
              maxLength={8}
              required
            />
          </label>
          <label>
            Hermandad
            <input value={form.hermandad} onChange={handleChange('hermandad')} required />
          </label>
          <label>
            Zona
            <input value={form.zonaTexto} onChange={handleChange('zonaTexto')} required />
          </label>
          <label>
            Rol
            <select value={form.rol} onChange={handleChange('rol')}>
              <option value="recolector">Recolector</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <p className="privacy-notice">
            <strong>Aviso de privacidad (informa al recolector):</strong> los últimos dígitos del DNI
            se piden únicamente para identificarle de forma inequívoca como recolector responsable de
            un turno de donaciones y evitar suplantaciones. Estos datos, junto con su nombre y
            apellidos, se conservan mientras mantenga la condición de recolector y hasta 5 años
            después por motivos de justificación contable, conforme a la normativa aplicable. No se
            ceden a terceros salvo obligación legal.
          </p>
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
            <th>Email</th>
            <th>Hermandad</th>
            <th>Zona</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recolectores.map((r) => (
            <tr key={r.id}>
              <td>
                {r.nombre} {r.apellidos}
              </td>
              <td>{r.email}</td>
              <td>{r.hermandad}</td>
              <td>{r.zonaTexto}</td>
              <td>{r.rol}</td>
              <td>{r.activo ? 'Activo' : 'Baja'}</td>
              <td className="table-acciones">
                <button className="btn btn-link" onClick={() => handleCambiarRol(r)}>
                  {r.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                </button>
                <button className="btn btn-link" onClick={() => handleToggleActivo(r)}>
                  {r.activo ? 'Dar de baja' : 'Reactivar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

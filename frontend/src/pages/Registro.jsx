import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extraerError } from '../api/client';

const FORM_INICIAL = {
  nombre: '',
  apellidos: '',
  email: '',
  password: '',
  dniUltimosDigitos: '',
  hermandad: '',
  zonaTexto: '',
};

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function handleChange(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await registrar(form);
      navigate('/');
    } catch (err) {
      setError(extraerError(err, 'No se ha podido completar el registro.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-kicker">Nuevo recolector</div>
      <h1 className="auth-title">Registro de recolector</h1>
      <p className="auth-lead">
        Regístrate para poder abrir turnos y registrar donaciones sobre el terreno. Solo te
        llevará un minuto.
      </p>

      <form className="form" onSubmit={handleSubmit} style={{ marginTop: 26 }}>
        <div className="field">
          <label htmlFor="rg-nombre">Nombre</label>
          <input className="input" id="rg-nombre" value={form.nombre} onChange={handleChange('nombre')} required />
        </div>
        <div className="field">
          <label htmlFor="rg-apellidos">Apellidos</label>
          <input className="input" id="rg-apellidos" value={form.apellidos} onChange={handleChange('apellidos')} required />
        </div>
        <div className="field">
          <label htmlFor="rg-email">Email</label>
          <input className="input" id="rg-email" type="email" value={form.email} onChange={handleChange('email')} required />
        </div>
        <div className="field">
          <label htmlFor="rg-password">Contraseña (mínimo 8 caracteres)</label>
          <input
            className="input"
            id="rg-password"
            type="password"
            minLength={8}
            value={form.password}
            onChange={handleChange('password')}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="rg-dni">Últimos dígitos del DNI</label>
          <input
            className="input"
            id="rg-dni"
            value={form.dniUltimosDigitos}
            onChange={handleChange('dniUltimosDigitos')}
            placeholder="p. ej. 1234A"
            maxLength={8}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="rg-hermandad">Hermandad / asociación</label>
          <input className="input" id="rg-hermandad" value={form.hermandad} onChange={handleChange('hermandad')} required />
        </div>
        <div className="field">
          <label htmlFor="rg-zona">Zona de recogida</label>
          <input
            className="input"
            id="rg-zona"
            value={form.zonaTexto}
            onChange={handleChange('zonaTexto')}
            placeholder="p. ej. Centro, Barrio Norte…"
            required
          />
        </div>

        <p className="privacy-notice">
          <strong>Aviso de privacidad:</strong> los últimos dígitos de tu DNI se piden únicamente
          para poder identificarte de forma inequívoca como recolector responsable de un turno de
          donaciones y evitar suplantaciones. Estos datos, junto con tu nombre y apellidos, se
          conservan mientras mantengas la condición de recolector y hasta 5 años después por
          motivos de justificación contable, conforme a la normativa aplicable. No se ceden a
          terceros salvo obligación legal.
        </p>

        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="auth-foot">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}

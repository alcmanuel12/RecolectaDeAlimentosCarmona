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
    <div className="page page-narrow">
      <h1>Registro de recolector</h1>
      <form className="form" onSubmit={handleSubmit}>
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
          Contraseña (mínimo 8 caracteres)
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
          Hermandad / asociación
          <input value={form.hermandad} onChange={handleChange('hermandad')} required />
        </label>
        <label>
          Zona de recogida
          <input
            value={form.zonaTexto}
            onChange={handleChange('zonaTexto')}
            placeholder="p. ej. Centro, Barrio Norte…"
            required
          />
        </label>

        <p className="privacy-notice">
          <strong>Aviso de privacidad:</strong> los últimos dígitos de tu DNI se piden únicamente
          para poder identificarte de forma inequívoca como recolector responsable de un turno de
          donaciones y evitar suplantaciones. Estos datos, junto con tu nombre y apellidos, se
          conservan mientras mantengas la condición de recolector y hasta 5 años después por
          motivos de justificación contable, conforme a la normativa aplicable. No se ceden a
          terceros salvo obligación legal.
        </p>

        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}

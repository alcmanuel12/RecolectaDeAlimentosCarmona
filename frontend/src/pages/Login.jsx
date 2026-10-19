import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extraerError } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const recolector = await login(email, password);
      navigate(recolector.rol === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(extraerError(err, 'No se ha podido iniciar sesión.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <span className="auth-hero-badge">Recogidas Solidarias</span>
        <h2>Bienvenido de nuevo</h2>
        <p>
          Accede a tu cuenta de recolector para abrir tu turno y seguir registrando donaciones para
          la hermandad.
        </p>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-panel-inner">
          <h1>Iniciar sesión</h1>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            <label>
              Contraseña
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
          <p>¿No tienes cuenta todavía? Pide al administrador de tu hermandad que te dé de alta.</p>
        </div>
      </div>
    </div>
  );
}

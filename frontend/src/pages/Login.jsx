import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="auth-page">
      <div className="auth-kicker">Acceso restringido</div>
      <h1 className="auth-title">Iniciar sesión</h1>
      <p className="auth-lead">
        Sólo para recolectores acreditados por su hermandad. El acceso queda registrado en el
        histórico del turno.
      </p>

      <form className="form" onSubmit={handleSubmit} style={{ marginTop: 26 }}>
        <div className="field">
          <label htmlFor="lg-email">Correo electrónico</label>
          <input
            className="input"
            id="lg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="lg-pass">Contraseña</label>
          <input
            className="input"
            id="lg-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="auth-foot">
        ¿Aún no tienes cuenta? <Link to="/registro">Regístrate como recolector</Link>
      </p>

      <div className="landing-note" style={{ marginTop: 34 }}>
        La app no procesa pagos con tarjeta. Los cobros se hacen con el datáfono físico de la
        hermandad.
      </div>
    </div>
  );
}

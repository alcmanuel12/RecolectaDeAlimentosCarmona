import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { recolector, logout, esAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon" aria-hidden="true">
          🤝
        </span>
        <span className="navbar-brand-text">
          <span className="navbar-brand-title">Recogidas Solidarias</span>
          <span className="navbar-brand-subtitle">Carmona</span>
        </span>
      </Link>
      <nav className="navbar-links">
        <Link to="/transparencia">Transparencia</Link>
        {recolector && !esAdmin && <Link to="/">Mi turno</Link>}
        {esAdmin && <Link to="/admin">Panel admin</Link>}
        {recolector ? (
          <>
            <span className="navbar-user">{recolector.nombre}</span>
            <button className="btn btn-link" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="navbar-cta">
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}

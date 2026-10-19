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
        <img
          className="navbar-brand-icon"
          src="https://res.cloudinary.com/dfc5psy3z/image/upload/v1792401103/Escudo-_qnafgb.svg"
          alt=""
          aria-hidden="true"
        />
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

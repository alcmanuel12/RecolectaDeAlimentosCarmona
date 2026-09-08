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
        🤝 Donaciones Solidarias
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
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/registro">Registrarse</Link>
          </>
        )}
      </nav>
    </header>
  );
}

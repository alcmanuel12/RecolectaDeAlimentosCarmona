import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envuelve rutas que requieren sesión iniciada. Con soloAdmin=true, exige
// además el rol de administrador.
export default function ProtectedRoute({ children, soloAdmin = false }) {
  const { recolector, cargando } = useAuth();

  if (cargando) return <div className="page-loading">Cargando…</div>;
  if (!recolector) return <Navigate to="/login" replace />;
  if (soloAdmin && recolector.rol !== 'admin') return <Navigate to="/turno" replace />;

  return children;
}

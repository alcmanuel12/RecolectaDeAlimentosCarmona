import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PanelRecolector from './pages/PanelRecolector';
import CarritoDonacion from './pages/CarritoDonacion';
import CierreTurno from './pages/CierreTurno';
import PanelAdmin from './pages/PanelAdmin';
import Transparencia from './pages/Transparencia';

function Inicio() {
  const { recolector, esAdmin, cargando } = useAuth();
  if (cargando) return <div className="page-loading">Cargando…</div>;
  if (!recolector) return <Landing />;
  return esAdmin ? <PanelAdmin /> : <PanelRecolector />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/transparencia" element={<Transparencia />} />
            <Route
              path="/carrito"
              element={
                <ProtectedRoute>
                  <CarritoDonacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cierre-turno"
              element={
                <ProtectedRoute>
                  <CierreTurno />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute soloAdmin>
                  <PanelAdmin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

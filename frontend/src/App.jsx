import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import PanelRecolector from './pages/PanelRecolector';
import CarritoDonacion from './pages/CarritoDonacion';
import CierreTurno from './pages/CierreTurno';
import PanelAdmin from './pages/PanelAdmin';
import Transparencia from './pages/Transparencia';

function Inicio() {
  const { esAdmin } = useAuth();
  return (
    <ProtectedRoute>{esAdmin ? <PanelAdmin /> : <PanelRecolector />}</ProtectedRoute>
  );
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

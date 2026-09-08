import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [recolector, setRecolector] = useState(() => {
    const guardado = localStorage.getItem('recolector');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [cargando, setCargando] = useState(true);

  // Al montar, si hay token guardado, refrescamos los datos del usuario.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCargando(false);
      return;
    }
    authApi
      .me()
      .then(({ recolector }) => {
        setRecolector(recolector);
        localStorage.setItem('recolector', JSON.stringify(recolector));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('recolector');
        setRecolector(null);
      })
      .finally(() => setCargando(false));
  }, []);

  function guardarSesion({ token, recolector }) {
    localStorage.setItem('token', token);
    localStorage.setItem('recolector', JSON.stringify(recolector));
    setRecolector(recolector);
  }

  async function login(email, password) {
    const datos = await authApi.login(email, password);
    guardarSesion(datos);
    return datos.recolector;
  }

  async function registrar(datosFormulario) {
    const datos = await authApi.registro(datosFormulario);
    guardarSesion(datos);
    return datos.recolector;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('recolector');
    setRecolector(null);
  }

  const value = {
    recolector,
    cargando,
    login,
    registrar,
    logout,
    esAdmin: recolector?.rol === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  return ctx;
}

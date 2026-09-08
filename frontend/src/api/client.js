import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({ baseURL: API_URL });

// Adjunta el JWT guardado en localStorage a cada petición saliente.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token caduca o es inválido, forzamos logout y volvemos al login.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('recolector');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;

// Extrae un mensaje de error legible de una respuesta de axios.
export function extraerError(err, fallback = 'Ha ocurrido un error inesperado.') {
  return err?.response?.data?.error || err?.message || fallback;
}

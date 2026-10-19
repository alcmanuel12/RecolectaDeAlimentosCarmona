require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const donacionRoutes = require('./routes/donacionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Falla rápido si falta el secreto de firma de JWT: sin esto, jsonwebtoken
// firmaría/verificaría tokens de forma insegura o lanzaría errores confusos
// en cada petición en lugar de al arrancar.
if (!process.env.JWT_SECRET) {
  console.error('Falta la variable de entorno JWT_SECRET. Define un secreto largo y aleatorio en .env antes de arrancar.');
  process.exit(1);
}

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

// Limita intentos de login para dificultar fuerza bruta y credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' },
});
app.use('/api/auth/login', authLimiter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/publico', publicRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// Manejador de errores centralizado.
// El detalle completo solo se registra en el log del servidor: exponer
// err.message al cliente puede filtrar detalles internos (rutas, consultas,
// nombres de columnas) útiles para un atacante.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const mensajePublico = status < 500 ? err.message : 'Error interno del servidor.';
  res.status(status).json({ error: mensajePublico || 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const donacionRoutes = require('./routes/donacionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/publico', publicRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// Manejador de errores centralizado
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

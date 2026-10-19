const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

function firmarToken(recolector) {
  return jwt.sign(
    { id: recolector.id, rol: recolector.rol, email: recolector.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );
}

function serializar(recolector) {
  const { passwordHash, ...resto } = recolector;
  return resto;
}

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  const recolector = await prisma.recolector.findUnique({ where: { email } });
  if (!recolector || !recolector.activo) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const ok = await bcrypt.compare(password, recolector.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const token = firmarToken(recolector);
  res.json({ token, recolector: serializar(recolector) });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const recolector = await prisma.recolector.findUnique({ where: { id: req.usuario.id } });
  if (!recolector) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json({ recolector: serializar(recolector) });
});

module.exports = { login, me };

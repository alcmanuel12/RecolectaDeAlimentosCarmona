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

// POST /api/auth/registro
const registro = asyncHandler(async (req, res) => {
  const { nombre, apellidos, email, password, dniUltimosDigitos, hermandad, zonaTexto } = req.body;

  if (!nombre || !apellidos || !email || !password || !dniUltimosDigitos || !hermandad || !zonaTexto) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const existente = await prisma.recolector.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ error: 'Ya existe un recolector con ese email.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const recolector = await prisma.recolector.create({
    data: {
      nombre,
      apellidos,
      email,
      dniUltimosDigitos,
      hermandad,
      zonaTexto,
      passwordHash,
    },
  });

  const token = firmarToken(recolector);
  res.status(201).json({ token, recolector: serializar(recolector) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
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

module.exports = { registro, login, me };

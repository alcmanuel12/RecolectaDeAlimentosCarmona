const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Comprueba que la petición trae un JWT válido y adjunta (id, rol, email) a
// req.usuario. El rol y el estado activo se leen de la base de datos en cada
// petición, de modo que una baja o un cambio de rol surten efecto al instante
// y no al caducar el token.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado. Falta el token.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o caducado.' });
  }

  try {
    const recolector = await prisma.recolector.findUnique({
      where: { id: payload.id },
      select: { id: true, rol: true, email: true, activo: true },
    });
    if (!recolector || !recolector.activo) {
      return res.status(401).json({ error: 'Usuario no válido o dado de baja.' });
    }
    req.usuario = { id: recolector.id, rol: recolector.rol, email: recolector.email };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };

const jwt = require('jsonwebtoken');

// Comprueba que la petición trae un JWT válido y adjunta el payload
// (id, rol, email) a req.usuario para que los controladores lo usen.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado. Falta el token.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o caducado.' });
  }
}

module.exports = { requireAuth };

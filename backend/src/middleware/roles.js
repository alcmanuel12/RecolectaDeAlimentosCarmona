// Middleware de autorización por rol. Úsalo después de requireAuth.
// Ejemplo: router.get('/admin/algo', requireAuth, requireRole('admin'), handler)
function requireRole(...rolesPermitidos) {
  return function (req, res, next) {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
    }
    next();
  };
}

module.exports = { requireRole };

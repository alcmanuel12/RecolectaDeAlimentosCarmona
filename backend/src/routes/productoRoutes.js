const express = require('express');
const { listar, crear, actualizar, baja } = require('../controllers/productoController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

// El catálogo lo necesita cualquier recolector autenticado para el carrito.
router.get('/', requireAuth, listar);
router.post('/', requireAuth, requireRole('admin'), crear);
router.put('/:id', requireAuth, requireRole('admin'), actualizar);
router.delete('/:id', requireAuth, requireRole('admin'), baja);

module.exports = router;

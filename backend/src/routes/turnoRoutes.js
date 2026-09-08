const express = require('express');
const { obtenerActivo, abrir, obtener, cerrar, listar } = require('../controllers/turnoController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.get('/activo', requireAuth, obtenerActivo);
router.post('/', requireAuth, abrir);
router.get('/', requireAuth, requireRole('admin'), listar);
router.get('/:id', requireAuth, obtener);
router.post('/:id/cerrar', requireAuth, cerrar);

module.exports = router;

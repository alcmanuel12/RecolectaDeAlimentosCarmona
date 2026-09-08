const express = require('express');
const {
  listarRecolectores,
  crearRecolector,
  actualizarRecolector,
  bajaRecolector,
  exportarDonacionesCsv,
} = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/recolectores', listarRecolectores);
router.post('/recolectores', crearRecolector);
router.put('/recolectores/:id', actualizarRecolector);
router.delete('/recolectores/:id', bajaRecolector);

router.get('/export/donaciones', exportarDonacionesCsv);

module.exports = router;

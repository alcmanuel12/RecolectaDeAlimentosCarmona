const express = require('express');
const { crear, obtener, listarPorTurno } = require('../controllers/donacionController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, crear);
router.get('/', requireAuth, listarPorTurno);
router.get('/:id', requireAuth, obtener);

module.exports = router;

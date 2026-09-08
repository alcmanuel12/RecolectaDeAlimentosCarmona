const express = require('express');
const { transparencia } = require('../controllers/publicController');

const router = express.Router();

// Sin autenticación: panel de transparencia pública.
router.get('/transparencia', transparencia);

module.exports = router;

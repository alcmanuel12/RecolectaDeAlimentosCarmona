const express = require('express');
const { registro, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/registro', registro);
router.post('/login', login);
router.get('/me', requireAuth, me);

module.exports = router;

const express = require('express');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routen
router.post('/register', register);
router.post('/login', login);

// Geschützte Routen
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router; 
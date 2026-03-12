const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  appleSignIn,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { validateRegister, validateLogin, validateProfileUpdate } = require('../utils/validators');

// Public routes
router.post('/register', validate(validateRegister), registerUser);
router.post('/login', validate(validateLogin), loginUser);
router.post('/apple-signin', appleSignIn);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validate(validateProfileUpdate), updateUserProfile);

module.exports = router; 
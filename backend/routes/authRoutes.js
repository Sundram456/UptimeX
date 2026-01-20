// Auth Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkValidationErrors = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

/**
 * POST /api/auth/signup
 * Register new user
 */
router.post(
    '/signup',
    authController.signupValidation,
    checkValidationErrors,
    authController.signup
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
    '/login',
    authController.loginValidation,
    checkValidationErrors,
    authController.login
);

/**
 * GET /api/auth/profile
 * Get user profile (protected)
 */
router.get(
    '/profile',
    authenticateToken,
    authController.getProfile
);

module.exports = router;

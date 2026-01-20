// Auth Controller - HTTP handlers for authentication
const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const { body } = require('express-validator');

/**
 * POST /api/auth/signup
 * Register a new user
 */
const signup = asyncHandler(async (req, res) => {
    const { email, username, password, first_name, last_name } = req.body;

    const result = await authService.signup({
        email,
        username,
        password,
        first_name,
        last_name,
    });

    res.status(201).json({
        message: 'User created successfully',
        user: result.user,
        token: result.token,
    });
});

/**
 * POST /api/auth/login
 * Login user
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json({
        message: 'Login successful',
        user: result.user,
        token: result.token,
    });
});

/**
 * GET /api/auth/profile
 * Get current user profile (protected)
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.user.id);

    res.json({
        user,
    });
});

/**
 * Validation middleware for signup
 */
const signupValidation = [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3 }).trim(),
    body('password').isLength({ min: 6 }),
    body('first_name').optional().trim(),
    body('last_name').optional().trim(),
];

/**
 * Validation middleware for login
 */
const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
];

module.exports = {
    signup,
    login,
    getProfile,
    signupValidation,
    loginValidation,
};

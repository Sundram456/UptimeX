// Utility functions for JWT token management
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generate JWT token for user
 * @param {object} user - User object with id, email
 * @returns {string} JWT token
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token or null
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = {
    generateToken,
    verifyToken,
};

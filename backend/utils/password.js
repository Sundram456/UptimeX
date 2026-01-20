// Password hashing utilities
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash password securely
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if matches
 */
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = {
    hashPassword,
    comparePassword,
};

// User model - Database operations for users
const { query } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new user
 * @param {object} userData - {email, username, password, first_name, last_name}
 * @returns {object} Created user
 */
async function createUser(userData) {
    const { email, username, password, first_name, last_name } = userData;
    const id = uuidv4();
    const password_hash = await hashPassword(password);

    const result = await query(
        `INSERT INTO users (id, email, username, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, username, first_name, last_name, created_at`,
        [id, email, username, password_hash, first_name, last_name]
    );

    return result.rows[0];
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {object} User object
 */
async function getUserByEmail(email) {
    const result = await query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {object} User object (without password)
 */
async function getUserById(id) {
    const result = await query(
        `SELECT id, email, username, first_name, last_name, is_active, created_at, updated_at
         FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}

/**
 * Verify user credentials
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {object} User object if valid, null otherwise
 */
async function verifyCredentials(email, password) {
    const user = await getUserByEmail(email);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) return null;

    return {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
    };
}

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    verifyCredentials,
};

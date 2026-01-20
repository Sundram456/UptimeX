// Auth Service - Business logic for authentication
const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

/**
 * User signup
 * @param {object} userData - {email, username, password, first_name, last_name}
 * @returns {object} User and token
 */
async function signup(userData) {
    const { email, username, password } = userData;

    // Check if user exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
        throw new Error('Email already registered');
    }

    // Create user
    const user = await userModel.createUser(userData);

    // Generate token
    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
        },
        token,
    };
}

/**
 * User login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} User and token
 */
async function login(email, password) {
    // Verify credentials
    const user = await userModel.verifyCredentials(email, password);
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user);

    return {
        user,
        token,
    };
}

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {object} User data
 */
async function getUserProfile(userId) {
    const user = await userModel.getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

module.exports = {
    signup,
    login,
    getUserProfile,
};

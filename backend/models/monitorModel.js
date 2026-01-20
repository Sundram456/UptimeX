// Monitor model - Database operations for monitors
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new monitor
 * @param {object} monitorData - {user_id, name, url, method, interval_seconds, description}
 * @returns {object} Created monitor
 */
async function createMonitor(monitorData) {
    const { user_id, name, url, method = 'GET', interval_seconds, description } = monitorData;
    const id = uuidv4();

    const result = await query(
        `INSERT INTO monitors (id, user_id, name, url, method, interval_seconds, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [id, user_id, name, url, method, interval_seconds, description]
    );

    return result.rows[0];
}

/**
 * Get all monitors for a user
 * @param {string} userId - User ID
 * @returns {array} Array of monitors
 */
async function getMonitorsByUserId(userId) {
    const result = await query(
        `SELECT m.*, 
                COALESCE(mss.current_status, 'UNKNOWN') as current_status,
                COALESCE(mss.uptime_percentage, 0) as uptime_percentage,
                COALESCE(mss.last_checked_at, NULL) as last_checked_at
         FROM monitors m
         LEFT JOIN monitor_status_summary mss ON m.id = mss.monitor_id
         WHERE m.user_id = $1
         ORDER BY m.created_at DESC`,
        [userId]
    );

    return result.rows;
}

/**
 * Get monitor by ID (check ownership)
 * @param {string} monitorId - Monitor ID
 * @param {string} userId - User ID (for ownership check)
 * @returns {object} Monitor object
 */
async function getMonitorById(monitorId, userId) {
    const result = await query(
        `SELECT m.*, 
                COALESCE(mss.current_status, 'UNKNOWN') as current_status,
                COALESCE(mss.uptime_percentage, 0) as uptime_percentage
         FROM monitors m
         LEFT JOIN monitor_status_summary mss ON m.id = mss.monitor_id
         WHERE m.id = $1 AND m.user_id = $2`,
        [monitorId, userId]
    );

    return result.rows[0];
}

/**
 * Update monitor
 * @param {string} monitorId - Monitor ID
 * @param {string} userId - User ID (for authorization)
 * @param {object} updates - Fields to update
 * @returns {object} Updated monitor
 */
async function updateMonitor(monitorId, userId, updates) {
    const { name, url, method, interval_seconds, is_active, description } = updates;

    const result = await query(
        `UPDATE monitors 
         SET name = COALESCE($1, name),
             url = COALESCE($2, url),
             method = COALESCE($3, method),
             interval_seconds = COALESCE($4, interval_seconds),
             is_active = COALESCE($5, is_active),
             description = COALESCE($6, description),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [name, url, method, interval_seconds, is_active, description, monitorId, userId]
    );

    return result.rows[0];
}

/**
 * Delete monitor
 * @param {string} monitorId - Monitor ID
 * @param {string} userId - User ID (for authorization)
 * @returns {boolean} Success
 */
async function deleteMonitor(monitorId, userId) {
    const result = await query(
        `DELETE FROM monitors WHERE id = $1 AND user_id = $2`,
        [monitorId, userId]
    );

    return result.rowCount > 0;
}

/**
 * Get all active monitors for health checking
 * @returns {array} Array of active monitors with user info
 */
async function getActiveMonitors() {
    const result = await query(
        `SELECT m.*, u.email as user_email
         FROM monitors m
         JOIN users u ON m.user_id = u.id
         WHERE m.is_active = true`
    );

    return result.rows;
}

module.exports = {
    createMonitor,
    getMonitorsByUserId,
    getMonitorById,
    updateMonitor,
    deleteMonitor,
    getActiveMonitors,
};

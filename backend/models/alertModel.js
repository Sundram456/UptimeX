// Alert model - Database operations for alerts
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new alert
 * @param {object} alertData - {monitor_id, user_id, alert_type, message}
 * @returns {object} Created alert
 */
async function createAlert(alertData) {
    const { monitor_id, user_id, alert_type, message } = alertData;
    const id = uuidv4();

    const result = await query(
        `INSERT INTO alerts (id, monitor_id, user_id, alert_type, message)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, monitor_id, user_id, alert_type, message]
    );

    return result.rows[0];
}

/**
 * Get recent alerts for a user
 * @param {string} userId - User ID
 * @param {number} limit - Limit results (default: 50)
 * @returns {array} Array of alerts
 */
async function getAlertsByUserId(userId, limit = 50) {
    const result = await query(
        `SELECT a.*, m.name as monitor_name, m.url
         FROM alerts a
         JOIN monitors m ON a.monitor_id = m.id
         WHERE a.user_id = $1
         ORDER BY a.sent_at DESC
         LIMIT $2`,
        [userId, limit]
    );

    return result.rows;
}

/**
 * Get alert history for throttling
 * @param {string} monitorId - Monitor ID
 * @param {string} alertType - Alert type
 * @returns {object} Alert history entry
 */
async function getAlertHistory(monitorId, alertType) {
    const result = await query(
        `SELECT * FROM alert_history 
         WHERE monitor_id = $1 AND alert_type = $2`,
        [monitorId, alertType]
    );

    return result.rows[0];
}

/**
 * Update or create alert history (for throttling)
 * @param {string} monitorId - Monitor ID
 * @param {string} alertType - Alert type
 * @param {number} consecutiveCount - Consecutive failure count
 * @returns {object} Updated history
 */
async function updateAlertHistory(monitorId, alertType, consecutiveCount = 1) {
    const result = await query(
        `INSERT INTO alert_history (monitor_id, alert_type, consecutive_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (monitor_id, alert_type)
         DO UPDATE SET 
            last_sent_at = CURRENT_TIMESTAMP,
            consecutive_count = $3
         RETURNING *`,
        [monitorId, alertType, consecutiveCount]
    );

    return result.rows[0];
}

/**
 * Mark alert as email sent
 * @param {string} alertId - Alert ID
 * @returns {object} Updated alert
 */
async function markAlertEmailSent(alertId) {
    const result = await query(
        `UPDATE alerts 
         SET email_sent = true
         WHERE id = $1
         RETURNING *`,
        [alertId]
    );

    return result.rows[0];
}

/**
 * Get unsent alerts
 * @returns {array} Array of unsent alerts
 */
async function getUnsentAlerts() {
    const result = await query(
        `SELECT a.*, u.email, m.url
         FROM alerts a
         JOIN users u ON a.user_id = u.id
         JOIN monitors m ON a.monitor_id = m.id
         WHERE a.email_sent = false
         ORDER BY a.sent_at ASC`
    );

    return result.rows;
}

module.exports = {
    createAlert,
    getAlertsByUserId,
    getAlertHistory,
    updateAlertHistory,
    markAlertEmailSent,
    getUnsentAlerts,
};

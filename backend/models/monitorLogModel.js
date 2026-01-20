// Monitor Log model - Database operations for health check results
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new monitor log entry
 * @param {object} logData - {monitor_id, status_code, response_time_ms, is_up, error_message}
 * @returns {object} Created log entry
 */
async function createMonitorLog(logData) {
    const { monitor_id, status_code, response_time_ms, is_up, error_message } = logData;
    const id = uuidv4();

    const result = await query(
        `INSERT INTO monitor_logs (id, monitor_id, status_code, response_time_ms, is_up, error_message)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, monitor_id, status_code, response_time_ms, is_up, error_message]
    );

    return result.rows[0];
}

/**
 * Get recent logs for a monitor
 * @param {string} monitorId - Monitor ID
 * @param {number} limit - Number of logs to retrieve (default: 100)
 * @returns {array} Array of logs
 */
async function getMonitorLogs(monitorId, limit = 100) {
    const result = await query(
        `SELECT * FROM monitor_logs 
         WHERE monitor_id = $1
         ORDER BY checked_at DESC
         LIMIT $2`,
        [monitorId, limit]
    );

    return result.rows;
}

/**
 * Get logs for a specific time period
 * @param {string} monitorId - Monitor ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {array} Array of logs
 */
async function getMonitorLogsByDateRange(monitorId, startDate, endDate) {
    const result = await query(
        `SELECT * FROM monitor_logs 
         WHERE monitor_id = $1 AND checked_at BETWEEN $2 AND $3
         ORDER BY checked_at DESC`,
        [monitorId, startDate, endDate]
    );

    return result.rows;
}

/**
 * Get status summary for a monitor
 * @param {string} monitorId - Monitor ID
 * @param {number} hoursBack - Number of hours to look back (default: 24)
 * @returns {object} Status summary
 */
async function getMonitorStatusSummary(monitorId, hoursBack = 24) {
    const result = await query(
        `SELECT 
            COUNT(*) as total_checks,
            SUM(CASE WHEN is_up THEN 1 ELSE 0 END) as successful_checks,
            ROUND(100.0 * SUM(CASE WHEN is_up THEN 1 ELSE 0 END) / COUNT(*), 2) as uptime_percentage,
            ROUND(AVG(response_time_ms)::numeric, 2) as avg_response_time_ms,
            MAX(status_code) as last_status_code,
            MAX(checked_at) as last_checked_at,
            MAX(CASE WHEN is_up THEN checked_at ELSE NULL END) as last_up_at,
            MAX(CASE WHEN NOT is_up THEN checked_at ELSE NULL END) as last_down_at
         FROM monitor_logs 
         WHERE monitor_id = $1 AND checked_at > NOW() - INTERVAL '1 hour' * $2`,
        [monitorId, hoursBack]
    );

    return result.rows[0];
}

/**
 * Get last check status for a monitor
 * @param {string} monitorId - Monitor ID
 * @returns {object} Last log entry
 */
async function getLastMonitorCheck(monitorId) {
    const result = await query(
        `SELECT * FROM monitor_logs 
         WHERE monitor_id = $1
         ORDER BY checked_at DESC
         LIMIT 1`,
        [monitorId]
    );

    return result.rows[0];
}

module.exports = {
    createMonitorLog,
    getMonitorLogs,
    getMonitorLogsByDateRange,
    getMonitorStatusSummary,
    getLastMonitorCheck,
};

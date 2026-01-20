// Monitor Service - Business logic for monitor operations
const monitorModel = require('../models/monitorModel');
const monitorLogModel = require('../models/monitorLogModel');
const alertModel = require('../models/alertModel');
const { isValidUrl, normalizeUrl } = require('../utils/urlValidator');

/**
 * Create a new monitor with validation
 * @param {string} userId - User ID
 * @param {object} monitorData - Monitor data
 * @returns {object} Created monitor
 */
async function createMonitor(userId, monitorData) {
    const { name, url, method, interval_seconds, description } = monitorData;

    // Validate required fields
    if (!name || !url || !interval_seconds) {
        throw new Error('Missing required fields: name, url, interval_seconds');
    }

    // Validate URL format
    const normalizedUrl = normalizeUrl(url);
    if (!isValidUrl(normalizedUrl)) {
        throw new Error('Invalid URL format');
    }

    // Validate interval
    if (interval_seconds < 30) {
        throw new Error('Interval must be at least 30 seconds');
    }

    return monitorModel.createMonitor({
        user_id: userId,
        name,
        url: normalizedUrl,
        method: method || 'GET',
        interval_seconds,
        description,
    });
}

/**
 * Get all monitors for user with analytics
 * @param {string} userId - User ID
 * @returns {array} Monitors with status
 */
async function getUserMonitors(userId) {
    const monitors = await monitorModel.getMonitorsByUserId(userId);

    // Enrich with recent check data
    const enrichedMonitors = await Promise.all(
        monitors.map(async (monitor) => {
            const summary = await monitorLogModel.getMonitorStatusSummary(monitor.id);
            return {
                ...monitor,
                stats: summary || {
                    total_checks: 0,
                    successful_checks: 0,
                    uptime_percentage: 0,
                    avg_response_time_ms: 0,
                },
            };
        })
    );

    return enrichedMonitors;
}

/**
 * Get monitor details with full analytics
 * @param {string} monitorId - Monitor ID
 * @param {string} userId - User ID
 * @returns {object} Monitor with detailed analytics
 */
async function getMonitorDetails(monitorId, userId) {
    const monitor = await monitorModel.getMonitorById(monitorId, userId);
    if (!monitor) throw new Error('Monitor not found');

    const summary = await monitorLogModel.getMonitorStatusSummary(monitorId, 24);
    const logs = await monitorLogModel.getMonitorLogs(monitorId, 50);
    const alerts = await alertModel.getAlertsByUserId(userId);

    return {
        ...monitor,
        stats: summary,
        recent_logs: logs,
        alerts: alerts.filter(a => a.monitor_id === monitorId),
    };
}

/**
 * Update monitor
 * @param {string} monitorId - Monitor ID
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {object} Updated monitor
 */
async function updateMonitor(monitorId, userId, updates) {
    if (updates.url) {
        const normalizedUrl = normalizeUrl(updates.url);
        if (!isValidUrl(normalizedUrl)) {
            throw new Error('Invalid URL format');
        }
        updates.url = normalizedUrl;
    }

    if (updates.interval_seconds && updates.interval_seconds < 30) {
        throw new Error('Interval must be at least 30 seconds');
    }

    return monitorModel.updateMonitor(monitorId, userId, updates);
}

/**
 * Delete monitor
 * @param {string} monitorId - Monitor ID
 * @param {string} userId - User ID
 * @returns {boolean} Success
 */
async function deleteMonitor(monitorId, userId) {
    const success = await monitorModel.deleteMonitor(monitorId, userId);
    if (!success) throw new Error('Monitor not found');
    return success;
}

module.exports = {
    createMonitor,
    getUserMonitors,
    getMonitorDetails,
    updateMonitor,
    deleteMonitor,
};

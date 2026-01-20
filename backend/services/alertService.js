// Alert Service - Business logic for alert operations and throttling
const alertModel = require('../models/alertModel');
const { sendAlertEmail } = require('../config/email');
require('dotenv').config();

const ALERT_THROTTLE_MINUTES = parseInt(process.env.ALERT_THROTTLE_MINUTES || '15');
const CONSECUTIVE_FAILURES_THRESHOLD = parseInt(process.env.CONSECUTIVE_FAILURES_THRESHOLD || '3');

/**
 * Check if alert should be throttled
 * @param {string} monitorId - Monitor ID
 * @param {string} alertType - Alert type (DOWN, SLOW, RECOVERED)
 * @returns {boolean} True if should throttle
 */
async function shouldThrottleAlert(monitorId, alertType) {
    const history = await alertModel.getAlertHistory(monitorId, alertType);

    if (!history) return false;

    const lastSentTime = new Date(history.last_sent_at);
    const now = new Date();
    const minutesPassed = (now - lastSentTime) / 1000 / 60;

    return minutesPassed < ALERT_THROTTLE_MINUTES;
}

/**
 * Trigger alert for monitor
 * @param {string} monitorId - Monitor ID
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} alertType - Alert type
 * @param {string} message - Alert message
 * @param {number} consecutiveCount - Consecutive failures
 * @returns {object} Alert or null if throttled
 */
async function triggerAlert(monitorId, userId, email, alertType, message, consecutiveCount) {
    // Check throttling
    const shouldThrottle = await shouldThrottleAlert(monitorId, alertType);
    if (shouldThrottle) {
        console.log(`Alert throttled for monitor ${monitorId}`);
        return null;
    }

    // Create alert record
    const alert = await alertModel.createAlert({
        monitor_id: monitorId,
        user_id: userId,
        alert_type: alertType,
        message,
    });

    // Update alert history
    await alertModel.updateAlertHistory(monitorId, alertType, consecutiveCount);

    // Send email (async, don't wait)
    sendAlertEmail(
        email,
        `UptimeX Alert: ${alertType}`,
        generateAlertEmailHtml(alertType, message)
    ).then((success) => {
        if (success) {
            alertModel.markAlertEmailSent(alert.id);
        }
    });

    return alert;
}

/**
 * Generate HTML for alert email
 * @param {string} alertType - Alert type
 * @param {string} message - Alert message
 * @returns {string} HTML content
 */
function generateAlertEmailHtml(alertType, message) {
    const colors = {
        DOWN: '#dc3545',
        SLOW: '#ffc107',
        RECOVERED: '#28a745',
    };

    const bgColor = colors[alertType] || '#007bff';

    return `
        <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="background-color: ${bgColor}; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                    <h2 style="margin: 0;">UptimeX Alert: ${alertType}</h2>
                </div>
                <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                    <p>${message}</p>
                    <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
                </div>
                <hr />
                <p><small>You are receiving this email because you have monitoring alerts enabled on UptimeX.</small></p>
            </body>
        </html>
    `;
}

/**
 * Get alerts for user
 * @param {string} userId - User ID
 * @param {number} limit - Limit results
 * @returns {array} Alerts
 */
async function getUserAlerts(userId, limit = 50) {
    return alertModel.getAlertsByUserId(userId, limit);
}

module.exports = {
    shouldThrottleAlert,
    triggerAlert,
    getUserAlerts,
    generateAlertEmailHtml,
};

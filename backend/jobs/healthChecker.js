// Health Checker Job - Background service that monitors URLs
// This runs independently and continuously checks monitor URLs
// Design supports horizontal scaling with worker processes
const axios = require('axios');
const cron = require('node-cron');
const monitorModel = require('../models/monitorModel');
const monitorLogModel = require('../models/monitorLogModel');
const alertService = require('../services/alertService');
require('dotenv').config();

const HEALTH_CHECK_INTERVAL_SECONDS = parseInt(process.env.HEALTH_CHECK_INTERVAL_SECONDS || '60');
const HEALTH_CHECK_TIMEOUT_MS = parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS || '10000');
const CONSECUTIVE_FAILURES_THRESHOLD = parseInt(process.env.CONSECUTIVE_FAILURES_THRESHOLD || '3');
const RESPONSE_TIME_THRESHOLD = parseInt(process.env.ALERT_THRESHOLD_RESPONSE_TIME || '5000');

// Track consecutive failures per monitor
const consecutiveFailures = new Map();

/**
 * Perform health check for a single monitor
 * @param {object} monitor - Monitor object
 * @returns {object} Check result
 */
async function performHealthCheck(monitor) {
    const startTime = Date.now();
    let statusCode = null;
    let isUp = false;
    let errorMessage = null;
    let responseTime = 0;

    try {
        const response = await axios({
            method: monitor.method || 'GET',
            url: monitor.url,
            timeout: HEALTH_CHECK_TIMEOUT_MS,
            validateStatus: () => true, // Don't throw on any status code
        });

        statusCode = response.status;
        responseTime = Date.now() - startTime;
        isUp = statusCode >= 200 && statusCode < 300;

    } catch (error) {
        responseTime = Date.now() - startTime;
        isUp = false;
        errorMessage = error.message;

        if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout';
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'DNS resolution failed';
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Connection refused';
        }
    }

    return {
        statusCode,
        responseTime,
        isUp,
        errorMessage,
    };
}

/**
 * Log check result and create alerts if needed
 * @param {object} monitor - Monitor object
 * @param {object} checkResult - Result from performHealthCheck
 */
async function processCheckResult(monitor, checkResult) {
    const { statusCode, responseTime, isUp, errorMessage } = checkResult;

    // Create log entry
    await monitorLogModel.createMonitorLog({
        monitor_id: monitor.id,
        status_code: statusCode,
        response_time_ms: responseTime,
        is_up: isUp,
        error_message: errorMessage,
    });

    // Update or reset consecutive failure count
    const previousFailures = consecutiveFailures.get(monitor.id) || 0;

    if (!isUp) {
        const newFailureCount = previousFailures + 1;
        consecutiveFailures.set(monitor.id, newFailureCount);

        // Trigger DOWN alert after threshold
        if (newFailureCount >= CONSECUTIVE_FAILURES_THRESHOLD && previousFailures < CONSECUTIVE_FAILURES_THRESHOLD) {
            console.log(`[ALERT] Monitor ${monitor.id} (${monitor.name}) is DOWN`);
            await alertService.triggerAlert(
                monitor.id,
                monitor.user_id,
                monitor.user_email,
                'DOWN',
                `Your monitored URL "${monitor.name}" has been down for ${newFailureCount} consecutive checks. Last error: ${errorMessage}`,
                newFailureCount
            );
        }
    } else {
        // URL is back up
        if (previousFailures > 0) {
            console.log(`[ALERT] Monitor ${monitor.id} (${monitor.name}) has RECOVERED`);
            await alertService.triggerAlert(
                monitor.id,
                monitor.user_id,
                monitor.user_email,
                'RECOVERED',
                `Your monitored URL "${monitor.name}" is back up after ${previousFailures} consecutive failures.`,
                1
            );
        }
        consecutiveFailures.set(monitor.id, 0);
    }

    // Check response time threshold
    if (responseTime > RESPONSE_TIME_THRESHOLD && isUp) {
        console.log(`[ALERT] Monitor ${monitor.id} (${monitor.name}) is SLOW`);
        await alertService.triggerAlert(
            monitor.id,
            monitor.user_id,
            monitor.user_email,
            'SLOW',
            `Your monitored URL "${monitor.name}" response time is ${responseTime}ms (threshold: ${RESPONSE_TIME_THRESHOLD}ms)`,
            1
        );
    }
}

/**
 * Run health check cycle
 * Fetches all active monitors and performs checks
 */
async function runHealthCheckCycle() {
    try {
        console.log(`[HEALTH_CHECK] Starting cycle at ${new Date().toISOString()}`);

        const monitors = await monitorModel.getActiveMonitors();
        console.log(`[HEALTH_CHECK] Found ${monitors.length} active monitors`);

        // Process monitors in parallel (with concurrency limit for better control)
        // For horizontal scaling: this could be split among worker processes
        const CONCURRENT_CHECKS = 5;

        for (let i = 0; i < monitors.length; i += CONCURRENT_CHECKS) {
            const batch = monitors.slice(i, i + CONCURRENT_CHECKS);
            const promises = batch.map(async (monitor) => {
                try {
                    const result = await performHealthCheck(monitor);
                    await processCheckResult(monitor, result);
                } catch (error) {
                    console.error(`[ERROR] Health check failed for monitor ${monitor.id}:`, error.message);
                }
            });

            await Promise.all(promises);
        }

        console.log(`[HEALTH_CHECK] Cycle completed at ${new Date().toISOString()}`);

    } catch (error) {
        console.error('[ERROR] Health check cycle failed:', error);
    }
}

/**
 * Initialize and start health checker job
 * Uses node-cron for reliable scheduling
 * 
 * Scalability notes:
 * - For distributed systems with multiple workers:
 *   1. Use Redis for distributed locking (node-redis + redlock)
 *   2. Use message queues (Bull/BullMQ) for job distribution
 *   3. Each worker processes monitors assigned to it
 *   4. Could shard monitors by interval or ID for better load distribution
 */
function startHealthChecker() {
    // Convert interval to cron expression
    // For now, run every HEALTH_CHECK_INTERVAL_SECONDS seconds
    const cronExpression = `*/${HEALTH_CHECK_INTERVAL_SECONDS} * * * * *`;

    console.log(`[HEALTH_CHECKER] Initialized with interval: ${HEALTH_CHECK_INTERVAL_SECONDS} seconds`);
    console.log(`[HEALTH_CHECKER] Cron expression: ${cronExpression}`);

    // Run immediately on start
    runHealthCheckCycle();

    // Schedule recurring checks
    const job = cron.schedule(cronExpression, runHealthCheckCycle);

    return job;
}

/**
 * Stop health checker job
 */
function stopHealthChecker(job) {
    if (job) {
        job.stop();
        console.log('[HEALTH_CHECKER] Stopped');
    }
}

module.exports = {
    startHealthChecker,
    stopHealthChecker,
    runHealthCheckCycle,
    performHealthCheck,
};

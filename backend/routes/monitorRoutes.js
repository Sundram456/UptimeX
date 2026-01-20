// Monitor Routes
const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const alertController = require('../controllers/alertController');
const checkValidationErrors = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

/**
 * POST /api/monitors
 * Create new monitor
 */
router.post(
    '/',
    monitorController.createMonitorValidation,
    checkValidationErrors,
    monitorController.createMonitor
);

/**
 * GET /api/monitors
 * Get all monitors for user
 */
router.get('/', monitorController.getMonitors);

/**
 * GET /api/monitors/:id
 * Get monitor details
 */
router.get('/:id', monitorController.getMonitor);

/**
 * GET /api/monitors/:id/logs
 * Get monitor logs
 */
router.get('/:id/logs', monitorController.getMonitorLogs);

/**
 * GET /api/monitors/:id/analytics
 * Get monitor analytics
 */
router.get('/:id/analytics', monitorController.getAnalytics);

/**
 * PUT /api/monitors/:id
 * Update monitor
 */
router.put(
    '/:id',
    monitorController.updateMonitorValidation,
    checkValidationErrors,
    monitorController.updateMonitor
);

/**
 * DELETE /api/monitors/:id
 * Delete monitor
 */
router.delete('/:id', monitorController.deleteMonitor);

/**
 * GET /api/alerts
 * Get all alerts for user
 */
router.get('/alerts', alertController.getAlerts);

module.exports = router;

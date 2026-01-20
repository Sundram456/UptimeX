// Monitor Controller - HTTP handlers for monitor operations
const monitorService = require('../services/monitorService');
const monitorLogModel = require('../models/monitorLogModel');
const alertService = require('../services/alertService');
const { asyncHandler } = require('../middleware/errorHandler');
const { body, param } = require('express-validator');

/**
 * POST /api/monitors
 * Create a new monitor
 */
const createMonitor = asyncHandler(async (req, res) => {
    const { name, url, method, interval_seconds, description } = req.body;

    const monitor = await monitorService.createMonitor(req.user.id, {
        name,
        url,
        method,
        interval_seconds,
        description,
    });

    res.status(201).json({
        message: 'Monitor created successfully',
        monitor,
    });
});

/**
 * GET /api/monitors
 * Get all monitors for user
 */
const getMonitors = asyncHandler(async (req, res) => {
    const monitors = await monitorService.getUserMonitors(req.user.id);

    res.json({
        monitors,
    });
});

/**
 * GET /api/monitors/:id
 * Get monitor details
 */
const getMonitor = asyncHandler(async (req, res) => {
    const monitor = await monitorService.getMonitorDetails(req.params.id, req.user.id);

    res.json({
        monitor,
    });
});

/**
 * GET /api/monitors/:id/logs
 * Get monitor logs
 */
const getMonitorLogs = asyncHandler(async (req, res) => {
    const { limit = 100, hoursBack = 24 } = req.query;

    // Verify monitor belongs to user
    const monitor = await monitorService.getMonitorDetails(req.params.id, req.user.id);

    const startDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    const endDate = new Date();

    const logs = await monitorLogModel.getMonitorLogsByDateRange(
        req.params.id,
        startDate,
        endDate
    );

    res.json({
        logs: logs.slice(0, parseInt(limit)),
    });
});

/**
 * PUT /api/monitors/:id
 * Update monitor
 */
const updateMonitor = asyncHandler(async (req, res) => {
    const { name, url, method, interval_seconds, is_active, description } = req.body;

    const monitor = await monitorService.updateMonitor(req.params.id, req.user.id, {
        name,
        url,
        method,
        interval_seconds,
        is_active,
        description,
    });

    if (!monitor) {
        return res.status(404).json({ error: 'Monitor not found' });
    }

    res.json({
        message: 'Monitor updated successfully',
        monitor,
    });
});

/**
 * DELETE /api/monitors/:id
 * Delete monitor
 */
const deleteMonitor = asyncHandler(async (req, res) => {
    await monitorService.deleteMonitor(req.params.id, req.user.id);

    res.json({
        message: 'Monitor deleted successfully',
    });
});

/**
 * GET /api/monitors/:id/analytics
 * Get analytics for a monitor
 */
const getAnalytics = asyncHandler(async (req, res) => {
    const { hoursBack = 24 } = req.query;

    // Verify monitor belongs to user
    const monitor = await monitorService.getMonitorDetails(req.params.id, req.user.id);

    const summary = await monitorLogModel.getMonitorStatusSummary(req.params.id, parseInt(hoursBack));

    res.json({
        analytics: summary,
    });
});

/**
 * Validation middleware for create monitor
 */
const createMonitorValidation = [
    body('name').notEmpty().trim(),
    body('url').notEmpty().trim(),
    body('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    body('interval_seconds').isInt({ min: 30 }),
    body('description').optional().trim(),
];

/**
 * Validation middleware for update monitor
 */
const updateMonitorValidation = [
    body('name').optional().trim(),
    body('url').optional().trim(),
    body('method').optional().isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    body('interval_seconds').optional().isInt({ min: 30 }),
    body('is_active').optional().isBoolean(),
    body('description').optional().trim(),
];

module.exports = {
    createMonitor,
    getMonitors,
    getMonitor,
    getMonitorLogs,
    updateMonitor,
    deleteMonitor,
    getAnalytics,
    createMonitorValidation,
    updateMonitorValidation,
};

// Alert Controller - HTTP handlers for alerts
const alertService = require('../services/alertService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/alerts
 * Get all alerts for user
 */
const getAlerts = asyncHandler(async (req, res) => {
    const { limit = 50 } = req.query;

    const alerts = await alertService.getUserAlerts(req.user.id, parseInt(limit));

    res.json({
        alerts,
    });
});

module.exports = {
    getAlerts,
};

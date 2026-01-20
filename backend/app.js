// Main Application Entry Point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const monitorRoutes = require('./routes/monitorRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { startHealthChecker } = require('./jobs/healthChecker');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security middleware
app.use(helmet());
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging (basic)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/monitors', monitorRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

let healthCheckerJob = null;

const server = app.listen(PORT, () => {
    console.log(`\n[START] UptimeX Backend Server`);
    console.log(`[SERVER] Running on port ${PORT}`);
    console.log(`[ENV] Node environment: ${process.env.NODE_ENV}`);
    console.log(`[ENV] Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

    // Start background health checker job
    try {
        healthCheckerJob = startHealthChecker();
        console.log(`[START] Health checker job started\n`);
    } catch (error) {
        console.error('[ERROR] Failed to start health checker job:', error);
    }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
    console.log('[SHUTDOWN] SIGTERM signal received');
    shutdown();
});

process.on('SIGINT', () => {
    console.log('[SHUTDOWN] SIGINT signal received');
    shutdown();
});

function shutdown() {
    console.log('[SHUTDOWN] Starting graceful shutdown...');

    // Stop health checker
    if (healthCheckerJob) {
        const { stopHealthChecker } = require('./jobs/healthChecker');
        stopHealthChecker(healthCheckerJob);
    }

    // Close server
    server.close(() => {
        console.log('[SHUTDOWN] Server closed');
        process.exit(0);
    });

    // Force exit after 30 seconds
    setTimeout(() => {
        console.error('[SHUTDOWN] Forced exit after timeout');
        process.exit(1);
    }, 30000);
}

module.exports = app;

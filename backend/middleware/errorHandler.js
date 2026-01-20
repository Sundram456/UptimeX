// Centralized error handling middleware
/**
 * Global error handler middleware
 * Should be placed LAST in the app.use() chain
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err.message, err.stack);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Validation errors
    if (err.status === 400) {
        statusCode = 400;
        message = err.message;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Database errors
    if (err.code === '23505') {
        statusCode = 409;
        message = 'Duplicate entry';
    }

    if (err.code === '23503') {
        statusCode = 400;
        message = 'Invalid reference';
    }

    res.status(statusCode).json({
        error: message,
        statusCode,
    });
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    asyncHandler,
};

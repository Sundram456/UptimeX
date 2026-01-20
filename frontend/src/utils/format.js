// Format utilities

export function formatDate(date) {
    return new Date(date).toLocaleString();
}

export function formatTime(ms) {
    return `${ms}ms`;
}

export function formatPercentage(value) {
    const num = parseFloat(value) || 0;
    return `${num.toFixed(2)}%`;
}

export function formatUptime(percentage) {
    if (percentage >= 99) return 'Excellent';
    if (percentage >= 95) return 'Good';
    if (percentage >= 90) return 'Fair';
    return 'Poor';
}

export function getStatusColor(status) {
    switch (status) {
        case 'UP':
            return '#28a745';
        case 'DOWN':
            return '#dc3545';
        case 'SLOW':
            return '#ffc107';
        default:
            return '#6c757d';
    }
}

export function getStatusBgColor(status) {
    switch (status) {
        case 'UP':
            return '#d4edda';
        case 'DOWN':
            return '#f8d7da';
        case 'SLOW':
            return '#fff3cd';
        default:
            return '#e2e3e5';
    }
}

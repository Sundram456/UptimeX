// Validation utilities

export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function validatePassword(password) {
    return password.length >= 6;
}

export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function validateInterval(interval) {
    return interval >= 30;
}

export function getValidationError(field, value) {
    switch (field) {
        case 'email':
            return !validateEmail(value) ? 'Invalid email format' : null;
        case 'password':
            return !validatePassword(value) ? 'Password must be at least 6 characters' : null;
        case 'url':
            return !validateUrl(value) ? 'Invalid URL format' : null;
        case 'interval_seconds':
            return !validateInterval(parseInt(value)) ? 'Interval must be at least 30 seconds' : null;
        default:
            return null;
    }
}

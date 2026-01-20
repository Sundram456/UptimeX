// URL validation utility
const url = require('url');

/**
 * Validate if URL is properly formatted
 * @param {string} urlString - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(urlString) {
    try {
        const urlObj = new url.URL(urlString);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Normalize URL (ensure protocol, trim whitespace)
 * @param {string} urlString - URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(urlString) {
    let normalized = urlString.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'https://' + normalized;
    }
    return normalized;
}

module.exports = {
    isValidUrl,
    normalizeUrl,
};

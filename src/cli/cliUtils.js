/**
 * src/cli/cliUtils.js
 * 
 * Utilities for CLI formatting and metrics calculation.
 */

/**
 * Formats a byte count into a human-readable string (e.g. "1.5 MB").
 * 
 * @param {number} bytes - The number of bytes.
 * @returns {string} The formatted string.
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0.0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Formats a duration in milliseconds to a string.
 * 
 * @param {number} ms - The number of milliseconds.
 * @returns {string} The formatted string (e.g. "150.000ms").
 */
export function formatDuration(ms) {
    return ms.toFixed(3) + 'ms';
}

/**
 * Formats throughput (speed) into a human-readable string.
 * 
 * @param {number} bytes - Total bytes processed.
 * @param {number} ms - Time taken in milliseconds.
 * @returns {string} The formatted throughput (e.g. "25.0 MB/s").
 */
export function formatThroughput(bytes, ms) {
    if (ms <= 0) return '∞ MB/s';
    const mb = bytes / 1024 / 1024;
    const seconds = ms / 1000;
    return (mb / seconds).toFixed(1) + ' MB/s';
}

/**
 * Formats the size ratio between original and processed data.
 * Returns a percentage string with sign.
 * 
 * @param {number} original - Original size in bytes.
 * @param {number} processed - Processed size in bytes.
 * @returns {string} The formatted ratio (e.g. "-50.0%").
 */
export function formatRatio(original, processed) {
    if (original === 0) return '+0.0%';
    const diff = processed - original;
    const percentage = (diff / original) * 100;
    const sign = percentage > 0 ? '+' : '';
    return sign + percentage.toFixed(1) + '%';
}

// Machine Readable Helpers
/**
 * Calculates throughput in MB/s.
 * 
 * @param {number} bytes - Total bytes.
 * @param {number} ms - Time in ms.
 * @returns {number} Throughput in MB/s.
 */
export function calculateThroughput(bytes, ms) {
    if (ms <= 0) return 0;
    const mb = bytes / 1024 / 1024;
    const seconds = ms / 1000;
    return mb / seconds;
}

/**
 * Calculates the percentage difference relative to original size.
 * 
 * @param {number} original - Original size.
 * @param {number} processed - Processed size.
 * @returns {number} Percentage difference (e.g. -50 for 50% compression).
 */
export function calculateRatioPct(original, processed) {
    if (original === 0) return 0;
    const diff = processed - original;
    return (diff / original) * 100;
}

/**
 * Rounds a number to a specified precision.
 * 
 * @param {number} num - The number to round.
 * @param {number} [precision=3] - The decimal places.
 * @returns {number} The rounded number.
 */
export function round(num, precision = 3) {
    return parseFloat(num.toFixed(precision));
}

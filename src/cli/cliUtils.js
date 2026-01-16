/**
 * src/cli/cliUtils.js
 * 
 * Utilities for CLI formatting and metrics.
 */

export function formatBytes(bytes) {
    if (bytes === 0) return '0.0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDuration(ms) {
    return ms.toFixed(3) + 'ms';
}

export function formatThroughput(bytes, ms) {
    if (ms <= 0) return '∞ MB/s';
    const mb = bytes / 1024 / 1024;
    const seconds = ms / 1000;
    return (mb / seconds).toFixed(1) + ' MB/s';
}

export function formatRatio(original, processed) {
    if (original === 0) return '+0.0%';
    const diff = processed - original;
    const percentage = (diff / original) * 100;
    const sign = percentage > 0 ? '+' : '';
    return sign + percentage.toFixed(1) + '%';
}

// Machine Readable Helpers
export function calculateThroughput(bytes, ms) {
    if (ms <= 0) return 0;
    const mb = bytes / 1024 / 1024;
    const seconds = ms / 1000;
    return mb / seconds;
}

export function calculateRatioPct(original, processed) {
    if (original === 0) return 0;
    const diff = processed - original;
    return (diff / original) * 100;
}

export function round(num, precision = 3) {
    return parseFloat(num.toFixed(precision));
}

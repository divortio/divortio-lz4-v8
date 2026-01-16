/**
 * benchmark/src/report/markdown/mdTableBase.js
 * 
 * Shared helper functions for generating markdown tables.
 */

/**
 * Generates a markdown table string.
 * @param {Array<object>} data - Array of objects to render.
 * @param {Array<{header: string, key: string, formatter?: function}>} columns - Column definitions.
 * @returns {string} Markdown table.
 */
export function generateTable(data, columns) {
    if (!data || data.length === 0) {
        return '*No data available*';
    }

    // 1. Header Row
    const headers = columns.map(c => c.header);
    const headerRow = `| ${headers.join(' | ')} |`;

    // 2. Separator Row
    const separators = columns.map(() => '---');
    const separatorRow = `| ${separators.join(' | ')} |`;

    // 3. Data Rows
    const rows = data.map(item => {
        const cells = columns.map(col => {
            const rawValue = getNestedValue(item, col.key);
            const value = col.formatter ? col.formatter(rawValue, item) : formatValue(rawValue);
            return value;
        });
        return `| ${cells.join(' | ')} |`;
    });

    return [headerRow, separatorRow, ...rows].join('\n');
}

/**
 * Generates a Key-Value markdown table (2 columns).
 * @param {object} data - The object to flatten and render.
 * @param {string} [keyHeader='Field']
 * @param {string} [valueHeader='Value']
 * @returns {string}
 */
export function generateKeyValueTable(data, keyHeader = 'Field', valueHeader = 'Value') {
    const entries = Object.entries(flattenObject(data));
    const columns = [
        { header: keyHeader, key: 'key' },
        { header: valueHeader, key: 'value' }
    ];
    // Map entries to array of objects for generateTable
    const tableData = entries.map(([k, v]) => ({ key: k, value: v }));
    return generateTable(tableData, columns);
}

/**
 * Sorts array of data.
 * @param {Array<object>} data 
 * @param {string} sortField 
 * @param {'asc'|'desc'} sortDirection 
 * @returns {Array<object>} Sorted copy.
 */
export function sortData(data, sortField, sortDirection = 'asc') {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
        const valA = getNestedValue(a, sortField);
        const valB = getNestedValue(b, sortField);

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Formats a value for markdown display.
 * @param {any} value 
 * @returns {string}
 */
export function formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
        // Simple heuristic: if float, fix to 2 decimals, else int
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    if (value instanceof Date) return formatTimeWithOffset(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

/**
 * Formats a Date to ISO 8601 with local timezone offset (e.g. 2023-10-27T10:00:00.000-04:00).
 * @param {Date|number} date 
 * @returns {string}
 */
export function formatTimeWithOffset(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    // Get local parts
    const tzo = -d.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';

    const pad = (num, digits = 2) => {
        num = Math.abs(num);
        return String(num).padStart(digits, '0');
    };

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const min = pad(d.getMinutes());
    const sec = pad(d.getSeconds());
    const ms = pad(d.getMilliseconds(), 3);

    const offHour = pad(Math.floor(Math.abs(tzo) / 60));
    const offMin = pad(Math.abs(tzo) % 60);

    return `${year}-${month}-${day}T${hour}:${min}:${sec}.${ms}${dif}${offHour}:${offMin}`;
}

// Helpers

function getNestedValue(obj, path) {
    if (!path) return undefined;
    if (!path.includes('.')) return obj[path];
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !(obj[k] instanceof Date)) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
}

/**
 * Formats bytes to human readable string (KB, MB, GB).
 * @param {number} bytes
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

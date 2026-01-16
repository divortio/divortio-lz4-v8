/**
 * benchmark/src/report/dsv/dsvBase.js
 * 
 * Base and helper functions for generating DSV (Delimiter Separated Values) reports.
 * Handles formatting, file writing, timestamps, and default paths.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to find project root (assuming we are deep in src/report/dsv)
// benchmark/src/report/dsv -> benchmark/
const BENCHMARK_ROOT = path.resolve(__dirname, '../../..');
const DEFAULT_RESULTS_DIR = path.join(BENCHMARK_ROOT, 'results');

/**
 * Formats a value for DSV.
 * Handles quoting for CSV if value contains delimiter or quotes.
 */
export function formatValue(value, separator = ',') {
    if (value === null || value === undefined) return '';

    let stringVal;
    if (value instanceof Date) {
        stringVal = value.toISOString();
    } else if (typeof value === 'object') {
        stringVal = JSON.stringify(value);
    } else {
        stringVal = String(value);
    }

    // Escape if needed
    // If it contains separator, newline, or double quote, wrap in quotes and escape internal quotes
    const needsQuotes = stringVal.includes(separator) || stringVal.includes('\n') || stringVal.includes('"');
    if (needsQuotes) {
        return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
}

/**
 * Generates DSV string content.
 * 
 * @param {Array<object>} data - Rows to render.
 * @param {Array<{header: string, key: string, formatter?: function}>} columns - Column defs.
 * @param {object} [options]
 * @param {string} [options.separator=','] - Delimiter (e.g. ',', '\t', '|').
 * @param {boolean} [options.includeHeader=true]
 * @param {Date} [options.timestamp] - Timestamp to append to every row. Defaults to new Date().
 * @param {string} [options.timestampHeader='Timestamp']
 * @returns {string} The DSV content.
 */
export function generateDSV(data, columns, options = {}) {
    const separator = options.separator || ',';
    const includeHeader = options.includeHeader !== false;
    const timestamp = options.timestamp || new Date();
    const timestampHeader = options.timestampHeader || 'dateTime';

    // Add Timestamp Column definition effectively
    const allColumns = [...columns, {
        header: timestampHeader,
        key: '__timestamp__', // special key we handle manually
        formatter: () => timestamp.toISOString()
    }];

    const lines = [];

    // Header
    if (includeHeader) {
        lines.push(allColumns.map(c => formatValue(c.header, separator)).join(separator));
    }

    // Rows
    if (data && data.length > 0) {
        for (const item of data) {
            const row = allColumns.map(col => {
                let val;
                if (col.key === '__timestamp__') {
                    val = timestamp;
                } else {
                    val = getNestedValue(item, col.key);
                }

                if (col.formatter) {
                    val = col.formatter(val, item);
                }
                return formatValue(val, separator);
            });
            lines.push(row.join(separator));
        }
    }

    return lines.join('\n');
}

/**
 * Writes DSV content to a file.
 * 
 * @param {string} content - The DSV string.
 * @param {string} [name='results'] - Base name for the file (e.g. 'config', 'results').
 * @param {object} [options]
 * @param {string} [options.path] - Explicit full path. If set, overrides name/defaultdir.
 * @param {string} [options.extension='csv'] - File extension.
 * @param {Date} [options.timestamp] - Timestamp used for filename generation if path not explicit.
 * @returns {string} The full path written to.
 */
export function writeDSV(content, name = 'results', options = {}) {
    let targetPath;

    if (options.path) {
        targetPath = path.resolve(process.cwd(), options.path);
        // If user gave a directory, append default filename logic? 
        // Spec says: "If the user provides a full valid filepath we would write to such path."
        // We assume options.path includes filename if it has extension, otherwise maybe treat as dir?
        // Let's stick to simple: if options.path provided, usage is explicit.

        // However, spec says: "The user can also pass a filename which will be written to the default directory."
        // We need to distinguish filename vs path.
        // Heuristic: if path has separators, it's a path. If not, it's a filename override?
        // But `options.path` is usually comprehensive.

    } else {
        // Default logic
        if (!fs.existsSync(DEFAULT_RESULTS_DIR)) {
            fs.mkdirSync(DEFAULT_RESULTS_DIR, { recursive: true });
        }

        const ext = options.extension || 'csv';
        const timestamp = options.timestamp || new Date();
        // Format: bench_${dateTime}_${results}.${csv}
        // ISO string contains colons which are bad for filenames on some OS.
        // Safe format: YYYY-MM-DDTHH-mm-ss
        const timeStr = timestamp.toISOString().replace(/:/g, '-').split('.')[0];

        const fileName = `bench_${timeStr}_${name}.${ext}`;
        targetPath = path.join(DEFAULT_RESULTS_DIR, fileName);
    }

    fs.writeFileSync(targetPath, content, 'utf-8');
    return targetPath;
}

// Helpers
function getNestedValue(obj, path) {
    if (!path) return undefined;
    if (!path.includes('.')) return obj[path];
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

export function sortData(data, sortField, sortDirection = 'asc') {
    if (!sortField || !data) return data;
    return [...data].sort((a, b) => {
        const valA = getNestedValue(a, sortField);
        const valB = getNestedValue(b, sortField);
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

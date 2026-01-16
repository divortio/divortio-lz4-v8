/**
 * src/cli/cliLog.js
 * 
 * Logging utility for LZ4 CLI.
 * Handles writing execution metrics to JSON, CSV, or TSV files.
 */

import fs from 'fs';
import path from 'path';
import { formatBytes } from './cliUtils.js';

export function writeLog(config, dataObj) {
    if (!config.log) return null;

    try {
        // 1. Resolve File Path
        let logPath = config.logPath;
        if (!logPath) {
            // Generate default: log_{command}_{timestamp}.{ext}
            // Use START time from dataObj for consistency, or current time?
            // User requested: log_${process}_${startTimestampUnixMsInteger}.${ext}
            const ts = dataObj.startTime; // Expecting ms integer from previous step
            const ext = config.logFormat;
            const cmd = (dataObj.processed && dataObj.processed.command) ? dataObj.processed.command : config.command;
            logPath = `log_${cmd}_${ts}.${ext}`;
        }

        const absLogPath = path.resolve(logPath);
        const exists = fs.existsSync(absLogPath);

        // 2. Prepare content based on format
        let contentToWrite = '';

        if (config.logFormat === 'json') {
            contentToWrite = JSON.stringify(dataObj) + '\n';
        } else {
            // CSV or TSV
            const separator = config.logFormat === 'csv' ? ',' : '\t';
            const flat = flattenObject(dataObj);
            const keys = Object.keys(flat).sort(); // Sort to ensure consistent column order if object order implies anything (it shouldn't but good for diffs)

            if (!exists) {
                // Write Header
                contentToWrite += keys.join(separator) + '\n';
            }

            // Write Value Row
            const values = keys.map(k => {
                const val = flat[k];
                // Escape if string contains separator or newline (basic CSV escaping)
                if (typeof val === 'string' && (val.includes(separator) || val.includes('\n') || val.includes('"'))) {
                    return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            });
            contentToWrite += values.join(separator) + '\n';
        }

        // 3. Write to file (Append)
        fs.appendFileSync(absLogPath, contentToWrite);

        // 4. Get File Stats
        const stats = fs.statSync(absLogPath);
        const sizeH = formatBytes(stats.size);

        return {
            path: absLogPath,
            sizeH: sizeH
        };

    } catch (err) {
        console.error(`Error writing to log file: ${err.message}`);
        return null;
    }
}

function flattenObject(obj, prefix = '', res = {}) {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key; // JSON-like dot notation for flattened keys? Or underscores?
            // "input.sizeH" is readable.
            if (typeof val === 'object' && val !== null) {
                flattenObject(val, newKey, res);
            } else {
                res[newKey] = val;
            }
        }
    }
    return res;
}

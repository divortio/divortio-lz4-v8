/**
 * benchmark/src/cli/cliLog.js
 * 
 * Logging utility for Benchmark CLI.
 * Handles writing execution metrics to JSON (NDJSON), CSV, or TSV files.
 */

import fs from 'fs';
import path from 'path';
import { generateResultsDSV } from '../report/dsv/dsvResults.js';


function formatBytes(bytes) {
    if (bytes === 0) return '0.0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function logResults(metrics, args) {
    if (!args.log) return;

    try {
        // 1. Resolve File Path
        let logPath = args.logPath;
        if (!logPath) {
            // Generate default: log_{command}_{timestamp}.{ext}
            const ts = Date.now();
            const ext = args.logFormat;
            const cmd = args.command || 'benchmark';
            logPath = `log_${cmd}_${ts}.${ext}`;
        }

        // Handle relative paths vs abs ? If no dir specified, cwd.
        // If logPath is just filename, assume cwd.
        const absLogPath = path.resolve(process.cwd(), logPath);
        const exists = fs.existsSync(absLogPath);

        let contentToWrite = '';

        if (args.logFormat === 'json') {
            // NDJSON: One line per metric
            if (Array.isArray(metrics)) {
                contentToWrite = metrics.map(m => JSON.stringify(m)).join('\n') + '\n';
            } else {
                contentToWrite = JSON.stringify(metrics) + '\n';
            }
        } else {
            // CSV/TSV
            const separator = args.logFormat === 'tsv' ? '\t' : ',';
            // We want header ONLY if !exists.
            const includeHeader = !exists;

            // Generate content using existing primitive
            // generateResultsDSV returns a string.
            // We need to ensure it uses the right separator and header logic.
            // Check dsvResults signature: (results, options) or (results, title, options)?
            // cliDSV: generateResultsDSV(results, undefined, { separator, includeHeader })
            contentToWrite = generateResultsDSV(metrics, undefined, {
                separator,
                includeHeader
            });

            // Ensure newline at end if not present? generateResultsDSV usually returns string.
            if (contentToWrite && !contentToWrite.endsWith('\n')) {
                contentToWrite += '\n';
            }
        }

        if (contentToWrite) {
            fs.appendFileSync(absLogPath, contentToWrite);

            // Get File Stats
            const stats = fs.statSync(absLogPath);
            const sizeH = formatBytes(stats.size);

            console.log(`Log: ${absLogPath} (${sizeH})`);
        }

    } catch (err) {
        console.error(`Error writing to log file: ${err.message}`);
    }
}

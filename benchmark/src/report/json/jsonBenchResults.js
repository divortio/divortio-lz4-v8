/**
 * benchmark/src/report/json/jsonBenchResults.js
 * 
 * JSON Reporting Module for Benchmark Results.
 * Supports standard JSON (overwrite) and JSON Lines (append).
 */

import fs from 'fs';
import path from 'path';

export class JSONBenchResults {
    /**
     * Generates a JSON report.
     * 
     * @param {import('../../result/benchResults.js').BenchResults} benchResults 
     * @param {object} options - { filename, isAppend }
     * @returns {string} - The path to the report file.
     */
    static generate(benchResults, options = {}) {
        const filename = options.filename || `report_${Date.now()}.json`;
        // Ensure extension
        const finalPath = filename.endsWith('.json') || filename.endsWith('.jsonl')
            ? filename
            : `${filename}.json`;

        if (options.isAppend) {
            return JSONBenchResults.append(benchResults, finalPath);
        } else {
            return JSONBenchResults.write(benchResults, finalPath);
        }
    }

    static write(benchResults, filepath) {
        const json = JSON.stringify(benchResults.toJSON(), null, 2);
        fs.writeFileSync(filepath, json, 'utf-8');
        console.log(`[JSON] Report generated: ${filepath}`);
        return filepath;
    }

    static append(benchResults, filepath) {
        // Appending behavior: JSON Lines (JSONL).
        // Each entry is a single line JSON object.
        // We do NOT read the file. We simply append.

        const jsonLine = JSON.stringify(benchResults.toJSON()); // No pretty print for lines
        fs.appendFileSync(filepath, jsonLine + '\n', 'utf-8');
        console.log(`[JSON] Appended to: ${filepath}`);
        return filepath;
    }
}

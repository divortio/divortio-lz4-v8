/**
 * benchmark/src/cli/cliJSON.js
 * 
 * CLI Adapter for JSON Reporting.
 */

import fs from 'fs';
import path from 'path';

export function generateReport(results, options = {}) {
    const filename = options.filename || `report_${Date.now()}.json`;
    const finalPath = filename.endsWith('.json') ? filename : `${filename}.json`;

    // For JSON, we might want the raw object
    // BenchResults should be serializable
    const data = results;

    // Handle Append
    if (options.isAppend && fs.existsSync(finalPath)) {
        try {
            const content = fs.readFileSync(finalPath, 'utf-8');
            let json = JSON.parse(content);
            if (!Array.isArray(json)) {
                json = [json];
            }
            json.push(data);
            fs.writeFileSync(finalPath, JSON.stringify(json, null, 2), 'utf-8');
            console.log(`[JSON] Appended to: ${finalPath}`);
            return finalPath;
        } catch (e) {
            console.warn(`[JSON] Failed to append to ${finalPath}, overwriting. Error: ${e.message}`);
        }
    }

    // Default: Overwrite
    fs.writeFileSync(finalPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[JSON] Report generated: ${finalPath}`);
    return finalPath;
}

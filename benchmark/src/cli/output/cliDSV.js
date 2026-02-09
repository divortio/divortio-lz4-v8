/**
 * benchmark/src/cli/cliDSV.js
 * 
 * CLI Adapter for CSV/TSV Reporting.
 */

import fs from 'fs';
import path from 'path';
import { generateResultsDSV } from '../../report/dsv/dsvResults.js';
import { generateResultsAggDSV } from '../../report/dsv/dsvResultsAgg.js';

export function generateReport(results, options = {}) {
    const format = options.format || 'csv';
    const separator = format === 'tsv' ? '\t' : ',';
    const ext = format === 'tsv' ? 'tsv' : 'csv';

    // Config from call
    const outDir = options.dir || path.resolve(process.cwd(), 'benchmark/results');
    const baseName = options.filename || `report_${Date.now()}`;
    const isAppend = options.isAppend || false;
    const includeHeader = options.noHeader !== true;

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const generatedFiles = [];

    // Helper
    const writeOrAppend = (file, content) => {
        if (isAppend && fs.existsSync(file)) {
            // Check if file is empty? If empty maybe we *should* header?
            // "We should add a CLI argument --no-header... This sets up the primitive for an append only operation."
            // Implicitly, if append is on, user controls header via --no-header. 
            // If user forgets --no-header, we write header.
            fs.appendFileSync(file, content + '\n', 'utf-8');
            console.log(`[${format.toUpperCase()}] Appended to: ${file}`);
        } else {
            // Overwrite or create
            fs.writeFileSync(file, content, 'utf-8');
            console.log(`[${format.toUpperCase()}] Report generated: ${file}`);
        }
    };

    // 1. Detailed Results
    const detailedContent = generateResultsDSV(results, undefined, { separator, includeHeader });
    if (detailedContent) {
        const file = path.join(outDir, `${baseName}_detailed.${ext}`);
        writeOrAppend(file, detailedContent);
        generatedFiles.push(file);
    }

    // 2. Aggregated Results (Summary)
    const aggContent = generateResultsAggDSV(results, undefined, { separator, includeHeader });
    if (aggContent) {
        const file = path.join(outDir, `${baseName}_summary.${ext}`);
        writeOrAppend(file, aggContent);
        generatedFiles.push(file);
    }

    return generatedFiles;
}

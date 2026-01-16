/**
 * benchmark/src/cli/cliMarkdown.js
 * 
 * CLI Adapter for Markdown Reporting.
 */

import { MarkdownReport } from '../report/markdown/mdReport.js';

/**
 * Generates a Markdown report from benchmark results.
 * @param {BenchResults} results 
 * @param {object} options 
 * @param {string} [options.filename] - Base filename or full path.
 */
export function generateReport(results, options = {}) {
    const reporter = new MarkdownReport(results);
    reporter.loadTemplates();

    // Determine filename
    // Default: report_<timestamp>.md
    // If output dir specified? mdReport.js saves to benchmark/results relative to project root usually.
    // The `save` method takes a filename.

    const baseName = options.filename || `report_${Date.now()}.md`;
    const finalName = baseName.endsWith('.md') ? baseName : `${baseName}.md`;

    const filePath = reporter.save(finalName);
    console.log(`[MD] Report generated: ${filePath}`);
    return filePath;
}

/**
 * benchmark/src/report/markdown/mdTableResults.js
 * 
 * Generates a markdown table for Benchmark Results (metrics).
 */

import { generateTable, sortData, formatValue, formatTimeWithOffset, formatBytes } from './mdTableBase.js';

const DEFAULT_COLUMNS = [
    { header: 'startTime', key: 'timestampStart', formatter: (v) => v ? formatTimeWithOffset(v) : '' },
    { header: 'File', key: 'filename' },
    { header: 'Library', key: 'library' },
    { header: 'inputSize', key: 'inputSize', formatter: (v) => formatBytes(v) },
    { header: 'outputSize', key: 'outputSize', formatter: (v) => formatBytes(v) },
    { header: 'Ratio', key: 'ratio', formatter: (v) => (typeof v === 'number') ? v.toFixed(2) : '' },
    { header: 'Duration (ms)', key: 'averageTime', formatter: (v) => (typeof v === 'number') ? v.toFixed(3) : '' },
    { header: 'Throughput', key: 'throughput', formatter: (v) => (typeof v === 'number') ? v.toFixed(2) + ' MB/s' : '' }
];

/**
 * Returns a markdown table for BenchResults.
 * @param {BenchResults} benchResults 
 * @param {Array} [columns=DEFAULT_COLUMNS] 
 * @param {string} [sortField='averageTime'] 
 * @param {'asc'|'desc'} [sortDirection='asc']
 * @returns {string}
 */
export function generateResultsTable(benchResults, columns = DEFAULT_COLUMNS, sortField = 'averageTime', sortDirection = 'asc') {
    if (!benchResults || !benchResults.results) return '';

    const flatRows = flattenResults(benchResults.results);
    const sorted = sortData(flatRows, sortField, sortDirection);

    return generateTable(sorted, columns);
}

/**
 * Flattens the nested results map into an array of row objects.
 * Handles both Single-File ({ lib: Result }) and Multi-File ({ file: { lib: Result } }) structures.
 */
function flattenResults(resultsMap) {
    const rows = [];
    const keys = Object.keys(resultsMap);
    if (keys.length === 0) return [];

    // We iterate over everything to be safe
    const firstVal = resultsMap[keys[0]];
    // Check constructor name if available
    const isResultsObject = (obj) => obj && (obj.constructor.name.includes('Results') || obj.average || obj.stats);

    if (isResultsObject(firstVal)) {
        for (const [libName, resObj] of Object.entries(resultsMap)) {
            rows.push(extractMetrics(resObj, libName));
        }
    } else {
        for (const [fileName, libMap] of Object.entries(resultsMap)) {
            for (const [libName, resObj] of Object.entries(libMap)) {
                rows.push(extractMetrics(resObj, libName, fileName));
            }
        }
    }

    return rows;
}

function extractMetrics(resObj, libName, fileNameOverride = null) {
    let tsStart = 0;
    let inputSize = 0;
    let outputSize = 0;
    let filename = fileNameOverride || resObj.name || 'Unknown';
    let avgDuration = 0;
    let avgThroughput = 0;

    // Check .samples (JSON) or .all (Class)
    const samples = resObj.samples || (resObj.all ? resObj.all : null);

    if (Array.isArray(samples) && samples.length > 0) {
        const first = samples[0];

        tsStart = first.timestampStart || 0;
        inputSize = first.inputSize || 0;
        outputSize = first.outputSize || 0;

        if (filename === 'Unknown' && first.name) {
            filename = first.name;
        }

        // Calculate Averages from Samples
        const validDurations = samples.map(s => s.durationMs).filter(d => typeof d === 'number');
        if (validDurations.length > 0) {
            avgDuration = validDurations.reduce((a, b) => a + b, 0) / validDurations.length;
        }

        const validThroughputs = samples.map(s => s.throughput).filter(t => typeof t === 'number');
        if (validThroughputs.length > 0) {
            // raw throughput is Bytes/s. Convert to MB/s
            const rawAvg = validThroughputs.reduce((a, b) => a + b, 0) / validThroughputs.length;
            avgThroughput = rawAvg / (1024 * 1024);
        }

    } else {
        // Fallback
        tsStart = resObj.timestampStart || 0;
        inputSize = resObj.inputSize || 0;
        outputSize = resObj.outputSize || 0;

        // Try to read properties directly
        if (resObj.durationMs) avgDuration = resObj.durationMs; // ResultClass has it
        if (resObj.throughput) {
            // If string (H), parse? If number (bytes/s), convert.
            // ResultClass instance has number (bytes/s)
            // JSON might have H string.
            if (typeof resObj.throughput === 'number') avgThroughput = resObj.throughput / (1024 * 1024);
        }
    }

    // Space Saving Ratio: (Input - Output) / Input
    // If input is 0, ratio 0.
    let ratio = 0;
    if (inputSize > 0) {
        ratio = (inputSize - outputSize) / inputSize;
    }

    return {
        timestampStart: tsStart,
        library: libName,
        filename: filename,
        inputSize: inputSize,
        outputSize: outputSize,
        averageTime: avgDuration,
        throughput: avgThroughput,
        ratio: ratio
    };
}

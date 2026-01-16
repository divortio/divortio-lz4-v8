/**
 * benchmark/src/report/dsv/dsvResults.js
 */

import { generateDSV, sortData } from './dsvBase.js';

const DEFAULT_COLUMNS = [
    { header: 'timestampStart', key: 'timestampStart' },
    { header: 'timestampEnd', key: 'timestampEnd' },
    { header: 'filename', key: 'filename' },
    { header: 'library', key: 'library' },
    { header: 'inputSize', key: 'inputSize' },
    { header: 'outputSize', key: 'outputSize' },
    { header: 'durationMs', key: 'durationMs' },
    { header: 'ratio', key: 'ratio', formatter: v => v ? v.toFixed(6) : '' },
    { header: 'throughput', key: 'throughput', formatter: v => v ? v.toFixed(3) : '' }
];

export function generateResultsDSV(benchResults, columns = DEFAULT_COLUMNS, options = {}) {
    if (!benchResults || !benchResults.results) return '';

    const flatRows = flattenResults(benchResults.results);
    // Sort by timestamp if available, else filename
    const sorted = sortData(flatRows, 'timestampStart', 'asc');

    return generateDSV(sorted, columns, options);
}

function flattenResults(resultsMap) {
    const rows = [];
    if (!resultsMap) return rows;

    const keys = Object.keys(resultsMap);
    if (keys.length === 0) return rows;

    const firstVal = resultsMap[keys[0]];
    // Check if Single Mode loop or Multi Mode loop
    // But importantly, we need to inspect the Result Object content to see if it allows sample extraction.
    // Assuming structure is correct.

    const isSingleFile = firstVal && (firstVal.stats || firstVal.average || firstVal.results || firstVal.samples || firstVal.all);

    // Helper to process a Result Set
    const processResultSet = (resObj, libName, fileNameOverride) => {
        // Try getting samples from .samples (JSON) or .all (Class)
        const samples = resObj.samples || (resObj.all ? resObj.all : null);

        if (Array.isArray(samples) && samples.length > 0) {
            // Detailed Mode
            for (const sample of samples) {
                rows.push(extractSampleMetrics(sample, libName, fileNameOverride || resObj.filename || resObj.name));
            }
        } else {
            // Fallback: Use summary stats if samples missing (legacy support?)
            // User requested individual rows, but if data is missing we might have to skip or just output summary as one row?
            // Let's output summary as one row but with limited data
            // rows.push(extractMetrics(resObj, libName, fileNameOverride));
        }
    };

    if (isSingleFile || (firstVal.constructor && firstVal.constructor.name.includes('Results'))) {
        // Single File: { LibName: ResultObj }
        for (const [libName, resObj] of Object.entries(resultsMap)) {
            processResultSet(resObj, libName);
        }
    } else {
        // Multi File: { FileName: { LibName: ResultObj } }
        for (const [fileName, libMap] of Object.entries(resultsMap)) {
            for (const [libName, resObj] of Object.entries(libMap)) {
                processResultSet(resObj, libName, fileName);
            }
        }
    }
    return rows;
}

function extractSampleMetrics(sample, libName, fileName) {
    const durationSe = sample.durationMs / 1000;
    const throughput = durationSe > 0 ? (sample.inputSize / durationSe) : 0;

    return {
        timestampStart: sample.timestampStart || 0,
        timestampEnd: sample.timestampEnd || 0,
        library: libName,
        filename: fileName || sample.name || 'Unknown',
        inputSize: sample.inputSize,
        outputSize: sample.outputSize || 0, // Output might be 0 if failed?
        durationMs: sample.durationMs,
        ratio: (sample.inputSize > 0 && sample.outputSize > 0) ? (sample.inputSize / sample.outputSize) : 0,
        throughput: throughput
    };
}

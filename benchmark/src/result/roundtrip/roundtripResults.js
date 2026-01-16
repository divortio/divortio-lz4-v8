/**
 * benchmark/src/result/roundtripResults.js
 * 
 * Collection of RoundtripResult instances.
 */

import fs from 'fs';
import { ResultsClass } from '../shared/resultsClass.js';
import { RoundtripResult } from './roundtripResult.js';
import { CompressionResult } from '../compression/compressionResult.js';
import { DecompressionResult } from '../decompression/decompressionResult.js';

export class RoundtripResults extends ResultsClass {
    /**
     * @param {RoundtripResult[]} [initialResults=[]]
     */
    constructor(initialResults = []) {
        super(initialResults);
    }

    /**
     * Adds a result.
     * @param {RoundtripResult} result
     * @override
     */
    addResult(result) {
        if (!(result instanceof RoundtripResult)) {
            throw new Error('Invalid argument: Must be instance of RoundtripResult');
        }
        super.addResult(result);
    }

    /**
     * Creates a RoundtripResults instance from JSON data (array of samples).
     * @param {object[]} samples
     * @returns {RoundtripResults}
     */
    static fromJSON(samples) {
        if (!Array.isArray(samples)) {
            throw new Error('Invalid JSON: expected array of samples');
        }
        const results = new RoundtripResults();
        for (const s of samples) {
            // Reconstruct component results
            const comp = new CompressionResult(
                s.compression.name,
                s.compression.inputSize,
                s.compression.outputSize,
                s.compression.startTime || 0, // Fallback if lost
                s.compression.endTime || 0
            );
            // Manually set duration if needed, but constructor takes start/end
            // We assume the JSON object has what we need or we recalculate.
            // The ResultClass constructor takes (name, input, output, start, end).
            // This relies on the raw JSON having these fields preserved.

            const decomp = new DecompressionResult(
                s.decompression.name,
                s.decompression.inputSize,
                s.decompression.outputSize,
                s.decompression.startTime || 0,
                s.decompression.endTime || 0
            );

            results.addResult(new RoundtripResult(comp, decomp));
        }
        return results;
    }

    /**
     * Creates a RoundtripResults instance from a JSON file.
     * @param {string} filePath
     * @returns {RoundtripResults}
     */
    static fromJSONFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const samples = JSON.parse(content);
        return RoundtripResults.fromJSON(samples);
    }
}

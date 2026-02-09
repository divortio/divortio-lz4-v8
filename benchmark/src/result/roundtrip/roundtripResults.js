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

/**
 * @class RoundtripResults
 * @extends ResultsClass
 */
export class RoundtripResults extends ResultsClass {

    /**
     * @param name {string}
     * @param initialResults {ResultsClass[]|[]}
     */
    constructor(name, initialResults=[]) {
        super('roundtrip', null, initialResults);
    }

    /**
     * Adds a result.
     * @param {ResultClass} result
     * @override
     */
    add(result) {
        if (!(result instanceof RoundtripResult)) {
            throw new Error('Invalid argument: Must be instance of RoundtripResult');
        }
        super.add(result);
    }

    /**
     * Creates a RoundtripResults instance from JSON data (array of samples).
     * @override
     * @param data {{type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number, compression: {type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number}, decompression: {type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number}, isLossless: boolean}}
     * @returns {RoundtripResults}
     */
    static fromJSON(data) {

        let samples = [];
        if (Array.isArray(data)) {
            samples = data;
        } else if (data && Array.isArray(data.samples)) {
            samples = data.samples;
        } else {
            throw new Error('Invalid JSON: expected array of samples or object with samples field');
        }

        const n = (data.name && data.name instanceof String && data.name.length > 0) ? data.name : null;

        const results = new RoundtripResults(n);

        for (const s of samples) {
            // Reconstruct component results
            const comp = new CompressionResult(
                s.compression.name,
                s.compression.inputSize,
                s.compression.outputSize,
                s.compression.startTime || 0, // Fallback if lost
                s.compression.endTime || 0,

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

            results.add(new RoundtripResult(comp, decomp));
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

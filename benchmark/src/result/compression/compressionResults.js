import fs from 'fs';
import { ResultsClass } from '../shared/resultsClass.js';
import { CompressionResult } from './compressionResult.js';

/**
 * @class CompressionResults
 * @extends ResultsClass
 * @description Collection of CompressionResult instances.
 */
export class CompressionResults extends ResultsClass {
    /**
     * @param {CompressionResult[]} [initialResults=[]]
     */
    constructor(initialResults = []) {
        super(initialResults);
    }

    /**
     * Adds a result.
     * @param {CompressionResult} result
     * @override
     */
    addResult(result) {
        if (!(result instanceof CompressionResult)) {
            throw new Error('Invalid argument: Must be instance of CompressionResult');
        }
        super.addResult(result);
    }

    /**
     * Creates a CompressionResults instance from JSON data (array of samples).
     * @param {object[]} samples
     * @returns {CompressionResults}
     */
    static fromJSON(data) {
        let samples = [];
        if (Array.isArray(data)) {
            samples = data;
        } else if (data && Array.isArray(data.samples)) {
            samples = data.samples;
        } else {
            // Fallback or error? If it's the stats object without samples, we can't fully rebuild.
            // But we might be OK if we just return empty or error.
            // For now, assume samples MUST be present for full hydration.
            // If not, maybe we just want the stats? But the class is built around samples.
            throw new Error('Invalid JSON: expected array of samples or object with samples field');
        }

        const results = new CompressionResults();
        for (const s of samples) {
            results.addResult(new CompressionResult(
                s.name,
                s.inputSize,
                s.outputSize,
                s.startTime,
                s.endTime,
                s.timestampStart,
                s.timestampEnd
            ));
        }
        return results;
    }

    /**
     * Creates a CompressionResults instance from a JSON file.
     * @param {string} filePath
     * @returns {CompressionResults}
     */
    static fromJSONFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const samples = JSON.parse(content);
        return CompressionResults.fromJSON(samples);
    }
}

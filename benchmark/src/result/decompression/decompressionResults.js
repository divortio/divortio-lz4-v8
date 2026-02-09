import fs from 'fs';
import { ResultsClass } from '../shared/resultsClass.js';
import { DecompressionResult } from './decompressionResult.js';

/**
 * @class DecompressionResults
 * @extends ResultsClass
 * @description Collection of DecompressionResult instances.
 */
export class DecompressionResults extends ResultsClass {
    /**
     * @param {DecompressionResult[]} [initialResults=[]]
     */
    constructor(initialResults = []) {
        super(null, null, initialResults);
    }

    /**
     * Adds a result.
     * @param {DecompressionResult} result
     * @override
     */
    add(result) {
        if (!(result instanceof DecompressionResult)) {
            throw new Error('Invalid argument: Must be instance of DecompressionResult');
        }
        super.add(result);
    }

    /**
     * Creates a DecompressionResults instance from JSON data (array of samples).
     * @param {object[]} samples
     * @returns {DecompressionResults}
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

        const results = new DecompressionResults();
        for (const s of samples) {
            results.add(new DecompressionResult(
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
     * Creates a DecompressionResults instance from a JSON file.
     * @param {string} filePath
     * @returns {DecompressionResults}
     */
    static fromJSONFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const samples = JSON.parse(content);
        return DecompressionResults.fromJSON(samples);
    }
}

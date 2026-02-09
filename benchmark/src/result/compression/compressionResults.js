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
        super(null, null, initialResults);
    }

}

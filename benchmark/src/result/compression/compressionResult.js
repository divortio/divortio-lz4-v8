import { ResultClass } from '../shared/resultClass.js';

/**
 * @class CompressionResult
 * @extends ResultClass
 * @description Represents the result of a single file compression operation.
 */
export class CompressionResult extends ResultClass {
    /**
     * @param {string} name - Filename or identifier.
     * @param {number} inputSize - Original file size in bytes.
     * @param {number} outputSize - Compressed size in bytes.
     * @param {number} startTime - Start timestamp (ms).
     * @param {number} endTime - End timestamp (ms).
     * @param {number} timestampStart - UNIX start timestamp (ms).
     * @param {number} timestampEnd - UNIX end timestamp (ms).
     */
    constructor(name, inputSize, outputSize, startTime, endTime, timestampStart, timestampEnd) {
        super('compression', name, inputSize, outputSize, startTime, endTime, timestampStart, timestampEnd);
    }
}

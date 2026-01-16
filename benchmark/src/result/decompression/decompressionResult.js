import { ResultClass } from '../shared/resultClass.js';

/**
 * @class DecompressionResult
 * @extends ResultClass
 * @description Represents the result of a single file decompression operation.
 */
export class DecompressionResult extends ResultClass {
    /**
     * @param {string} name - Filename or identifier.
     * @param {number} inputSize - Compressed input size in bytes.
     * @param {number} outputSize - Decompressed output size in bytes.
     * @param {number} startTime - Start timestamp (ms).
     * @param {number} endTime - End timestamp (ms).
     * @param {number} timestampStart - UNIX start timestamp (ms).
     * @param {number} timestampEnd - UNIX end timestamp (ms).
     */
    constructor(name, inputSize, outputSize, startTime, endTime, timestampStart, timestampEnd) {
        super(name, inputSize, outputSize, startTime, endTime, timestampStart, timestampEnd);
    }

    /**
     * @override
     * @returns {object}
     */
    toJSON() {
        return {
            ...super.toJSON(),
            type: 'Decompression'
        };
    }
}

/**
 * benchmark/src/result/roundtripResult.js
 * 
 * Represents the result of a full compression -> decompression cycle.
 * Composes individual CompressionResult and DecompressionResult instances.
 */

import { ResultClass } from '../shared/resultClass.js';

export class RoundtripResult extends ResultClass {
    /**
     * @param {CompressionResult} compressionResult
     * @param {DecompressionResult} decompressionResult
     */
    constructor(compressionResult, decompressionResult) {
        // We use the compression result's metadata for the base class
        // Total duration is sum of both components
        // Start time is compression start, End time is decompression end
        super(
            compressionResult.name,
            compressionResult.inputSize, // Output of roundtrip is original input (ideally)
            compressionResult.startTime,
            decompressionResult.endTime,
            compressionResult.timestampStart,
            decompressionResult.timestampEnd
        );

        this.compression = compressionResult;
        this.decompression = decompressionResult;
    }

    /**
     * Total duration of the roundtrip operation in milliseconds.
     * @returns {number}
     */
    get totalDurationMs() {
        return this.compression.durationMs + this.decompression.durationMs;
    }

    /**
     * Validates if the roundtrip was lossless (original input size === final output size).
     * @returns {boolean}
     */
    get isLossless() {
        return this.compression.inputSize === this.decompression.outputSize;
    }

    /**
     * JSON representation.
     * @returns {object}
     */
    toJSON() {
        return {
            ...super.toJSON(),
            compression: this.compression.toJSON(),
            decompression: this.decompression.toJSON(),
            isLossless: this.isLossless
        };
    }
}

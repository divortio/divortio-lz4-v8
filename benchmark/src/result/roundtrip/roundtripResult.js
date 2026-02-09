/**
 * benchmark/src/result/roundtripResult.js
 * 
 * Represents the result of a full compression -> decompression cycle.
 * Composes individual CompressionResult and DecompressionResult instances.
 */

import { ResultClass } from '../shared/resultClass.js';

export class RoundtripResult extends ResultClass {

    /**
     *
     * @type {CompressionResult}
     */
  compression ;
    /**
     *
     * @type {DecompressionResult}
     */
    decompression ;

    /**
     * @param {CompressionResult} compressionResult
     * @param {DecompressionResult} decompressionResult
     */
    constructor(compressionResult, decompressionResult) {
        // We use the compression result's metadata for the base class
        // Total duration is sum of both components
        // Start time is compression start, End time is decompression end
        super('roundtrip',
            compressionResult.name,
            compressionResult.inputSize,
            decompressionResult.inputSize,
            compressionResult.startTime,
            decompressionResult.endTime,
            compressionResult.timestampStart,
            decompressionResult.timestampEnd
        );

        /**
         *
         * @type {CompressionResult}
         */
        this.compression = compressionResult;
        /**
         *
         * @type {DecompressionResult}
         */
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
     * Creates a CompressionResults instance from JSON data (array of samples).
     * @param data {{type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number, compression: {type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number}, decompression: {type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number}, isLossless: boolean}}
     * @returns {ResultsClass}
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
        const t = (data.type && data.type instanceof String && data.type.length > 0) ? data.type : null;
        const n = (data.name && data.name instanceof String && data.name.length > 0) ? data.name : null;
        const results = new ResultsClass(t, n);
        for (const s of samples) {
            results.add(new ResultClass(
                s.type,
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
     * JSON representation.
     * @returns {{type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number, compression: {type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number}, decompression: {type: string, name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number}, isLossless: boolean}}
     */
    toJSON() {
        return {
            type: this.type,
            name: this.name,
            inputSize: this.inputSize,
            inputSizeH: this.inputSizeH,
            outputSize: this.outputSize,
            outputSizeH: this.outputSizeH,
            startTime: this.startTime,
            endTime: this.endTime,
            durationMs: parseFloat(this.durationMs.toFixed(3)),
            throughput: this.throughputH,
            throughputBytes: this.throughput,
            ratio: this.ratio,
            timestampStart: this.timestampStart,
            timestampEnd: this.timestampEnd,
            compression: this.compression.toJSON(),
            decompression: this.decompression.toJSON(),
            isLossless: this.isLossless
        };
    }
}

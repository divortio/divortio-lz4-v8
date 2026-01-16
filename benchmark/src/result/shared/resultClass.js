/**
 * @class ResultClass
 * @description Base class representing the raw data and metrics of a single benchmark operation.
 * Encapsulates timing and size data to provide performance metrics.
 */
export class ResultClass {
    /**
     * @param {string} name - Name of the test case (e.g., filename or corpus name).
     * @param {number} inputSize - Size of input data in bytes.
     * @param {number} outputSize - Size of output data in bytes.
     * @param {number} startTime - High-resolution start timestamp (ms).
     * @param {number} endTime - High-resolution end timestamp (ms).
     * @param {number} timestampStart - UNIX start timestamp (ms).
     * @param {number} timestampEnd - UNIX end timestamp (ms).
     */
    constructor(name, inputSize, outputSize, startTime, endTime, timestampStart, timestampEnd) {
        /** @type {string} */
        this.name = name;
        /** @type {number} */
        this.inputSize = inputSize;
        /** @type {number} */
        this.outputSize = outputSize;
        /** @type {number} */
        this.startTime = startTime;
        /** @type {number} */
        this.endTime = endTime;
        /** @type {number} */
        this.timestampStart = timestampStart;
        /** @type {number} */
        this.timestampEnd = timestampEnd;

        // Cached properties
        this._durationMs = undefined;
        this._throughput = undefined;
        this._ratio = undefined;
    }

    /**
     * Duration of the operation in milliseconds.
     * @returns {number}
     */
    get durationMs() {
        if (this._durationMs === undefined) {
            this._durationMs = this.endTime - this.startTime;
        }
        return this._durationMs;
    }

    /**
     * Duration in seconds.
     * @returns {number}
     */
    get durationSec() {
        return this.durationMs / 1000;
    }

    /**
     * Throughput in Bytes per Second (input processing rate).
     * @returns {number}
     */
    get throughput() {
        if (this._throughput === undefined) {
            const sec = this.durationSec;
            this._throughput = sec <= 0 ? 0 : this.inputSize / sec;
        }
        return this._throughput;
    }

    /**
     * Throughput in human-readable format.
     * @returns {string}
     */
    get throughputH() {
        return ResultClass.formatBytes(this.throughput) + '/s';
    }

    /**
     * Completion ratio (Output / Input).
     * For compression, lower is better (< 1.0).
     * For decompression, usually meaningless, but we track it for consistency.
     * @returns {number}
     */
    get ratio() {
        if (this._ratio === undefined) {
            this._ratio = this.inputSize === 0 ? 0 : parseFloat((this.outputSize / this.inputSize).toFixed(4));
        }
        return this._ratio;
    }

    /**
     * Human readable input size.
     * @returns {string}
     */
    get inputSizeH() {
        return ResultClass.formatBytes(this.inputSize);
    }

    /**
     * Human readable output size.
     * @returns {string}
     */
    get outputSizeH() {
        return ResultClass.formatBytes(this.outputSize);
    }

    /**
     * Formats bytes to human-readable string.
     * @param {number} bytes
     * @returns {string}
     */
    static formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Returns plain object representation.
     * @returns {object}
     */
    toJSON() {
        return {
            name: this.name,
            inputSize: this.inputSize,
            outputSize: this.outputSize,
            startTime: this.startTime,
            endTime: this.endTime,
            durationMs: parseFloat(this.durationMs.toFixed(3)),
            throughput: this.throughputH,
            ratio: this.ratio,
            timestampStart: this.timestampStart,
            timestampEnd: this.timestampEnd
        };
    }
}

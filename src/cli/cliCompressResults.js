/**
 * src/cli/cliCompressResults.js
 * 
 * Handles storing and serializing the results of a compression operation.
 */

import { formatBytes, formatDuration, formatThroughput, formatRatio, calculateThroughput, calculateRatioPct, round } from './cliUtils.js';

/**
 * Class representing the results of a compression command.
 */
export class CliCompressResults {
    /**
     * Create a Compression Results collector.
     */
    constructor() {
        /**
         * The CLI command that was executed.
         * @type {string}
         */
        this.command = '';

        /**
         * Start timestamp (ms).
         * @type {number}
         */
        this.startTime = 0;

        /**
         * End timestamp (ms).
         * @type {number}
         */
        this.endTime = 0;

        /**
         * Input file stats.
         * @type {object}
         */
        this.input = {};

        /**
         * Read operation stats.
         * @type {object}
         */
        this.read = {};

        /**
         * Compression operation stats.
         * @type {object}
         */
        this.compress = {};

        /**
         * Write operation stats.
         * @type {object}
         */
        this.write = {};

        /**
         * Output file stats.
         * @type {object}
         */
        this.output = {};
    }

    /**
     * Sets the start time of the operation.
     */
    start() {
        this.startTime = Date.now();
    }

    /**
     * Sets the end time of the operation.
     */
    end() {
        this.endTime = Date.now();
    }

    /**
     * Records input details.
     * @param {string} path - Input file path.
     * @param {number} size - Input file size in bytes.
     */
    recordInput(path, size) {
        this.input = {
            path,
            size,
            sizeH: formatBytes(size)
        };
    }

    /**
     * Records read performance details.
     * @param {number} size - Bytes read.
     * @param {number} durationMs - Duration in milliseconds.
     */
    recordRead(size, durationMs) {
        this.read = {
            size,
            sizeH: formatBytes(size),
            durationMs: round(durationMs),
            durationH: formatDuration(durationMs),
            throughputMBps: round(calculateThroughput(size, durationMs)),
            throughputH: formatThroughput(size, durationMs)
        };
    }

    /**
     * Records compression performance details.
     * @param {number} inSize - Input size in bytes.
     * @param {number} outSize - Output size in bytes.
     * @param {number} durationMs - Duration in milliseconds.
     */
    recordCompress(inSize, outSize, durationMs) {
        this.compress = {
            inputSize: inSize,
            inputSizeH: formatBytes(inSize),
            outputSize: outSize,
            outputSizeH: formatBytes(outSize),
            durationMs: round(durationMs),
            durationH: formatDuration(durationMs),
            throughputMBps: round(calculateThroughput(inSize, durationMs)),
            throughputH: formatThroughput(inSize, durationMs),
            ratioPct: round(calculateRatioPct(inSize, outSize)),
            ratioH: formatRatio(inSize, outSize)
        };
    }

    /**
     * Records write performance details.
     * @param {number} size - Bytes written.
     * @param {number} durationMs - Duration in milliseconds.
     */
    recordWrite(size, durationMs) {
        this.write = {
            size,
            sizeH: formatBytes(size),
            durationMs: round(durationMs),
            durationH: formatDuration(durationMs),
            throughputMBps: round(calculateThroughput(size, durationMs)),
            throughputH: formatThroughput(size, durationMs)
        };
    }

    /**
     * Records final output file details.
     * @param {string} path - Output path.
     * @param {number} size - Output size.
     */
    recordOutput(path, size) {
        this.output = {
            path,
            size,
            sizeH: formatBytes(size)
        };
    }

    /**
     * Sets the command string.
     * @param {string[]} args 
     */
    setCommand(args) {
        this.command = "node src/lz4CLI.js " + args.join(' ');
    }

    /**
     * Returns the serialized JSON object.
     * @returns {object}
     */
    toJSON() {
        const totalMs = this.endTime - this.startTime;
        const inSize = this.input.size || 0;
        const outSize = this.output.size || 0;

        return {
            startTime: this.startTime,
            startTimeH: new Date(this.startTime).toISOString(),
            endTime: this.endTime,
            endTimeH: new Date(this.endTime).toISOString(),
            command: this.command,
            input: this.input,
            read: this.read,
            compress: this.compress,
            write: this.write,
            processed: {
                command: 'compress',
                inputSize: inSize,
                inputSizeH: formatBytes(inSize),
                outputSize: outSize,
                outputSizeH: formatBytes(outSize),
                ratioPct: round(calculateRatioPct(inSize, outSize)),
                ratioH: formatRatio(inSize, outSize),
                durationMs: round(totalMs),
                durationH: formatDuration(totalMs),
                throughputMBps: round(calculateThroughput(inSize, totalMs)),
                throughputH: formatThroughput(inSize, totalMs)
            },
            output: this.output
        };
    }
}

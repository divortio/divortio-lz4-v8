/**
 * src/cli/cliDecompressResults.js
 * 
 * Handles storing and serializing the results of a decompression operation.
 */

import { formatBytes, formatDuration, formatThroughput, formatRatio, calculateThroughput, calculateRatioPct, round } from './cliUtils.js';

/**
 * Class representing the results of a decompression command.
 */
export class CliDecompressResults {
    constructor() {
        this.command = '';
        this.startTime = 0;
        this.endTime = 0;
        this.input = {};
        this.read = {};
        this.decompress = {}; // Decompression stats
        this.write = {};
        this.output = {};
    }

    start() {
        this.startTime = Date.now();
    }

    end() {
        this.endTime = Date.now();
    }

    /**
     * Records input details.
     * @param {string} path 
     * @param {number} size 
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
     * @param {number} size 
     * @param {number} durationMs 
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
     * Records decompression performance details.
     * @param {number} inSize 
     * @param {number} outSize 
     * @param {number} durationMs 
     */
    recordDecompress(inSize, outSize, durationMs) {
        this.decompress = {
            inputSize: inSize,
            inputSizeH: formatBytes(inSize),
            outputSize: outSize,
            outputSizeH: formatBytes(outSize),
            durationMs: round(durationMs),
            durationH: formatDuration(durationMs),
            throughputMBps: round(calculateThroughput(inSize, durationMs)),
            throughputH: formatThroughput(inSize, durationMs),
            ratioPct: round(calculateRatioPct(outSize, inSize)), // Ratio is original/compressed usually? Or just relation?
            // For decompress, usually we care about expansion. 
            // But existing utils calculateRatioPct(a, b) -> (b/a)*100
            // Here inSize is compressed, outSize is original.
            // Ratio often reported as Compressed/Original (which is < 100%).
            // So calculateRatioPct(outSize, inSize) = (inSize/outSize)*100 = Compression Ratio re-verified.
            ratioH: formatRatio(outSize, inSize) // Note: order matters for consistency w/ compress
        };
    }

    /**
     * Records write performance details.
     * @param {number} size 
     * @param {number} durationMs 
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
     * @param {string} path 
     * @param {number} size 
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
            decompress: this.decompress,
            write: this.write,
            processed: {
                command: 'decompress',
                inputSize: inSize,
                inputSizeH: formatBytes(inSize),
                outputSize: outSize,
                outputSizeH: formatBytes(outSize),
                ratioPct: round(calculateRatioPct(outSize, inSize)),
                ratioH: formatRatio(outSize, inSize),
                durationMs: round(totalMs),
                durationH: formatDuration(totalMs),
                throughputMBps: round(calculateThroughput(inSize, totalMs)),
                throughputH: formatThroughput(inSize, totalMs)
            },
            output: this.output
        };
    }
}

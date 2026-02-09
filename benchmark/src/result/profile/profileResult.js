/**
 * benchmark/src/result/profile/profileResult.js
 * 
 * Base class for a single profile operation result.
 */

export class ProfileResult {
    /**
     * @param {string} libraryName
     * @param {string} operation - compress, decompress, roundtrip
     * @param {number} inputSize - Total input size in bytes
     * @param {number} durationMs - Wall clock duration of the profile listLibs
     * @param {string} tickLogPath - Path to the simplified tick log
     * @param {string} processedLogPath - Path to the processed JSON log
     */
    constructor(libraryName, operation, inputSize, durationMs, tickLogPath, processedLogPath) {
        this.libraryName = libraryName;
        this.operation = operation;
        this.inputSize = inputSize;
        this.durationMs = durationMs;
        this.tickLogPath = tickLogPath;
        this.processedLogPath = processedLogPath;

        // Calculated Throughput (approximate)
        // inputSize bytes / duration ms * 1000 = bytes/sec
        // / 1024 / 1024 = MB/sec
        this.throughputMBps = durationMs > 0
            ? (inputSize / 1024 / 1024) / (durationMs / 1000)
            : 0;
    }

    toJSON() {
        return {
            library: this.libraryName,
            operation: this.operation,
            inputSize: this.inputSize,
            durationMs: this.durationMs,
            throughputMBps: parseFloat(this.throughputMBps.toFixed(2)),
            logs: {
                tick: this.tickLogPath,
                processed: this.processedLogPath
            }
        };
    }
}

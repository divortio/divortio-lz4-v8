/**
 * benchmark/src/bench/compress/benchCompressInProc.js
 * 
 * Executes compression benchmark for multiple libraries on a single file.
 */

import { performance } from 'perf_hooks';
import { CompressionResult } from '../../result/compression/compressionResult.js';
import { CompressionResults } from '../../result/compression/compressionResults.js';

export class BenchCompressInProc {
    /**
     * @param {Array<{name: string, library: object}>} libraries - List of initialized libraries.
     * @param {object} inputFile - The InputFile or CorpusFile instance.
     * @param {number} [samples=5]
     * @param {number} [warmups=2]
     */
    constructor(libraries, inputFile, samples = 5, warmups = 2) {
        // Enforce array
        this.libraries = Array.isArray(libraries) ? libraries : [libraries];
        this.inputFile = inputFile;
        this.samples = samples;
        this.warmups = warmups;

        /** @type {Object.<string, CompressionResults>} */
        this.results = {};
    }

    /**
     * Runs the benchmark for all libraries.
     * @returns {Promise<Object.<string, CompressionResults>>}
     */
    async run() {
        // Load content ONCE for all libraries
        const inputBuffer = this.inputFile.load();

        for (const { name, library } of this.libraries) {

            // 1. Load Library
            if (typeof library.load === 'function') {
                await library.load();
            }

            // 2. Warmup
            for (let i = 0; i < this.warmups; i++) {
                library.compress(inputBuffer);
            }

            // 3. Measure
            const libResults = new CompressionResults();

            for (let i = 0; i < this.samples; i++) {
                if (global.gc) global.gc();

                const timestampStart = Date.now();
                const start = performance.now();
                const compressed = library.compress(inputBuffer);
                const end = performance.now();
                const timestampEnd = Date.now();

                const outputSize = compressed.byteLength || compressed.length;

                libResults.add(new CompressionResult(
                    this.inputFile.filename,
                    inputBuffer.byteLength,
                    outputSize,
                    start,
                    end,
                    timestampStart,
                    timestampEnd
                ));
            }

            this.results[name] = libResults;
        }

        return this.results;
    }
}

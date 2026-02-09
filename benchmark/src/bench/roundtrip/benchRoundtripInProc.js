/**
 * benchmark/src/bench/roundtrip/benchRoundtripInProc.js
 * 
 * Executes roundtrip benchmark for multiple libraries on a single file.
 */

import { performance } from 'perf_hooks';
import { CompressionResult } from '../../result/compression/compressionResult.js';
import { DecompressionResult } from '../../result/decompression/decompressionResult.js';
import { RoundtripResult } from '../../result/roundtrip/roundtripResult.js';
import { RoundtripResults } from '../../result/roundtrip/roundtripResults.js';

export class BenchRoundtripInProc {
    /**
     * @param {Array<{name: string, library: object}>} libraries
     * @param {object} inputFile
     * @param {number} [samples=5]
     * @param {number} [warmups=2]
     */
    constructor(libraries, inputFile, samples = 5, warmups = 2) {
        this.libraries = Array.isArray(libraries) ? libraries : [libraries];
        this.inputFile = inputFile;
        this.samples = samples;
        this.warmups = warmups;

        /** @type {Object.<string, RoundtripResults>} */
        this.results = {};
    }

    async run() {
        const inputBuffer = this.inputFile.load();

        for (const { name, library } of this.libraries) {

            if (typeof library.load === 'function') {
                await library.load();
            }

            // Warmup
            for (let i = 0; i < this.warmups; i++) {
                const c = library.compress(inputBuffer);
                library.decompress(c);
            }

            // Measure
            const libResults = new RoundtripResults();

            for (let i = 0; i < this.samples; i++) {
                if (global.gc) global.gc();

                // Compress
                const tsStartC = Date.now();
                const startC = performance.now();
                const compressed = library.compress(inputBuffer);
                const endC = performance.now();
                const tsEndC = Date.now();

                // Decompress
                const tsStartD = Date.now();
                const startD = performance.now();
                const decompressed = library.decompress(compressed);
                const endD = performance.now();
                const tsEndD = Date.now();

                const cResult = new CompressionResult(
                    this.inputFile.filename,
                    inputBuffer.byteLength,
                    compressed.byteLength || compressed.length,
                    startC,
                    endC,
                    tsStartC,
                    tsEndC
                );

                const dResult = new DecompressionResult(
                    this.inputFile.filename,
                    compressed.byteLength || compressed.length,
                    decompressed.byteLength || decompressed.length,
                    startD,
                    endD,
                    tsStartD,
                    tsEndD
                );

                libResults.add(new RoundtripResult(cResult, dResult));
            }

            this.results[name] = libResults;
        }

        return this.results;
    }
}

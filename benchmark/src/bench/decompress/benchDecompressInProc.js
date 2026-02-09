/**
 * benchmark/src/bench/decompress/benchDecompressInProc.js
 * 
 * Executes decompression benchmark for multiple libraries on a single file.
 */

import { performance } from 'perf_hooks';
import { DecompressionResult } from '../../result/decompression/decompressionResult.js';
import { DecompressionResults } from '../../result/decompression/decompressionResults.js';

export class BenchDecompressInProc {
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

        /** @type {Object.<string, DecompressionResults>} */
        this.results = {};
    }

    async run() {
        const inputBuffer = this.inputFile.load();

        for (const { name, library } of this.libraries) {

            if (typeof library.load === 'function') {
                await library.load();
            }

            // For decompression, we need the COMPRESSED payload first.
            // We assume the library can compress what it decompresses.
            // Or we should have pre-compressed files? 
            // In Roundtrip we compress then decompress.
            // In basic BenchDecompress, we typically compress once into memory, then loop decompression.

            // 1. Prepare Compressed Data
            // We do this just once per library (outside the measure loop)
            const compressed = library.compress(inputBuffer);

            // 2. Warmup
            for (let i = 0; i < this.warmups; i++) {
                library.decompress(compressed);
            }

            // 3. Measure
            const libResults = new DecompressionResults();

            for (let i = 0; i < this.samples; i++) {
                if (global.gc) global.gc();

                const timestampStart = Date.now();
                const start = performance.now();
                const decompressed = library.decompress(compressed);
                const end = performance.now();
                const timestampEnd = Date.now();

                const compressedSize = compressed.byteLength || compressed.length;
                const outputSize = decompressed.byteLength || decompressed.length;

                libResults.add(new DecompressionResult(
                    this.inputFile.filename,
                    compressedSize,
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

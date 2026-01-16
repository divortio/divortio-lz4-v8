/**
 * benchmark/src/bench/compress/benchCompressFilesInProc.js
 * 
 * Benchmarks compression across multiple input files and multiple libraries.
 */

import { BenchCompressInProc } from './benchCompressInProc.js';

export class BenchCompressFilesInProc {
    /**
     * @param {Array<{name: string, library: object}>} libraries
     * @param {Array<InputFile|CorpusFile>} inputFiles
     * @param {number} samples
     * @param {number} warmups
     */
    constructor(libraries, inputFiles, samples = 5, warmups = 2) {
        this.libraries = libraries;
        this.inputFiles = inputFiles;
        this.samples = samples;
        this.warmups = warmups;

        /** @type {Object.<string, Object.<string, CompressionResults>>} */
        // { "filename": { "libName": Results } }
        this.results = {};
    }

    /**
     * @returns {Promise<Object>}
     */
    async run() {
        for (const inputFile of this.inputFiles) {
            // Instantiate Single File Runner (which handles Multi-Lib)
            const bench = new BenchCompressInProc(this.libraries, inputFile, this.samples, this.warmups);

            // Returns { "libName": Results }
            const fileResults = await bench.run();

            this.results[inputFile.filename] = fileResults;
        }

        return this.results;
    }
}

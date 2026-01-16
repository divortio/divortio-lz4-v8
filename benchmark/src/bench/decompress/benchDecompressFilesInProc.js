/**
 * benchmark/src/bench/decompress/benchDecompressFilesInProc.js
 * 
 * Benchmarks decompression across multiple input files and multiple libraries.
 */

import { BenchDecompressInProc } from './benchDecompressInProc.js';

export class BenchDecompressFilesInProc {
    constructor(libraries, inputFiles, samples = 5, warmups = 2) {
        this.libraries = libraries;
        this.inputFiles = inputFiles;
        this.samples = samples;
        this.warmups = warmups;
        this.results = {}; // { filename: { libName: Results } }
    }

    async run() {
        for (const inputFile of this.inputFiles) {
            const bench = new BenchDecompressInProc(this.libraries, inputFile, this.samples, this.warmups);
            this.results[inputFile.filename] = await bench.run();
        }
        return this.results;
    }
}

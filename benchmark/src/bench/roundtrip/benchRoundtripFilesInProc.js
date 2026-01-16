/**
 * benchmark/src/bench/roundtrip/benchRoundtripFilesInProc.js
 */

import { BenchRoundtripInProc } from './benchRoundtripInProc.js';

export class BenchRoundtripFilesInProc {
    constructor(libraries, inputFiles, samples = 5, warmups = 2) {
        this.libraries = libraries;
        this.inputFiles = inputFiles;
        this.samples = samples;
        this.warmups = warmups;
        this.results = {};
    }

    async run() {
        for (const inputFile of this.inputFiles) {
            const bench = new BenchRoundtripInProc(this.libraries, inputFile, this.samples, this.warmups);
            this.results[inputFile.filename] = await bench.run();
        }
        return this.results;
    }
}

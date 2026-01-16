/**
 * benchmark/src/bench/compress/benchCompressCorpusSpawn.js
 * 
 * Convenience wrapper to benchmark an entire corpus via spawn (Multi-Lib supported).
 */

import { BenchCompressFilesSpawn } from './benchCompressFilesSpawn.js';

export class BenchCompressCorpusSpawn {
    /**
     * @param {string|string[]} libraryNames
     * @param {string} corpusName
     * @param {number} samples
     * @param {number} warmups
     */
    constructor(libraryNames, corpusName, samples = 5, warmups = 2) {
        this.runner = new BenchCompressFilesSpawn(libraryNames, [corpusName], samples, warmups);
    }

    run() {
        return this.runner.run();
    }
}

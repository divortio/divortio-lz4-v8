/**
 * benchmark/src/bench/decompress/benchDecompressCorpusSpawn.js
 */

import { BenchDecompressFilesSpawn } from './benchDecompressFilesSpawn.js';

export class BenchDecompressCorpusSpawn {
    constructor(libraryNames, corpusName, samples = 5, warmups = 2) {
        this.runner = new BenchDecompressFilesSpawn(libraryNames, [corpusName], samples, warmups);
    }

    run() {
        return this.runner.run();
    }
}

/**
 * benchmark/src/bench/roundtrip/benchRoundtripCorpusSpawn.js
 */

import { BenchRoundtripFilesSpawn } from './benchRoundtripFilesSpawn.js';

export class BenchRoundtripCorpusSpawn {
    constructor(libraryNames, corpusName, samples = 5, warmups = 2) {
        this.runner = new BenchRoundtripFilesSpawn(libraryNames, [corpusName], samples, warmups);
    }

    run() {
        return this.runner.run();
    }
}

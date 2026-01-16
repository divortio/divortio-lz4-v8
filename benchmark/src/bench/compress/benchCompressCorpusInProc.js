/**
 * benchmark/src/bench/compress/benchCompressCorpusInProc.js
 * 
 * Benchmarks compression for all files in a named corpus across multiple libraries.
 */

import { Corpus } from '../../corpus/corpus.js';
import { CorpusFile } from '../../inputs/corpusFile.js';
import { findCorpusKey } from '../../inputs/inputUtils.js';
import { BenchCompressFilesInProc } from './benchCompressFilesInProc.js';

export class BenchCompressCorpusInProc {
    /**
     * @param {Array<{name: string, library: object}>} libraries
     * @param {string} corpusName
     * @param {number} samples
     * @param {number} warmups
     */
    constructor(libraries, corpusName, samples = 5, warmups = 2) {
        this.libraries = libraries;
        this.corpusName = corpusName;
        this.samples = samples;
        this.warmups = warmups;
        this.results = {};
    }

    async run() {
        const corpusKey = findCorpusKey(this.corpusName, Corpus);
        if (!corpusKey) {
            throw new Error(`Corpus not found: ${this.corpusName}`);
        }

        const corpusfilesMap = Corpus[corpusKey];
        const inputFiles = [];
        for (const fKey of Object.keys(corpusfilesMap)) {
            inputFiles.push(new CorpusFile(corpusKey, fKey));
        }

        const runner = new BenchCompressFilesInProc(this.libraries, inputFiles, this.samples, this.warmups);
        this.results = await runner.run();
        return this.results;
    }
}

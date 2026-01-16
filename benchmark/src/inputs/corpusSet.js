/**
 * benchmark/inputs/corpusSet.js
 * 
 * Represents a complete set of files from a specific Corpus.
 * Loads all files belonging to the named corpus.
 */

import { InputFiles } from './inputFiles.js';
import { CorpusFile } from './corpusFile.js';
import { findCorpusKey } from './inputUtils.js';

export class CorpusSet extends InputFiles {
    /**
     * @param {string} corpusName - Name of the corpus (e.g., 'lz-flex'). Fuzzy matched.
     */
    constructor(corpusName) {
        super();

        // 1. Resolve Corpus
        const resolvedCorpusKey = findCorpusKey(corpusName, Corpus);
        if (!resolvedCorpusKey) {
            throw new Error(`Corpus not found: '${corpusName}'`);
        }

        this.name = resolvedCorpusKey;
        const corpusData = Corpus[resolvedCorpusKey];

        // 2. Iterate and add all files
        // corpusData keys are filenames
        for (const filename of Object.keys(corpusData)) {
            const file = new CorpusFile(resolvedCorpusKey, filename);
            this.add(file);
        }
    }
}

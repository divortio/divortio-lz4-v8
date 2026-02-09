/**
 * benchmark/src/cli/cliCorpusFiles.js
 * 
 * Logic to expand a corpus name (e.g. 'silesia') into all its contained files.
 */

import {CorpusFile} from "../../../input/file/corpusFile.js";
import {CorpusCatalog} from "../../../input/corpora/corpusCatalog.js";

// import { CorpusFile } from '../inputs/corpusFile.js';
// import { CorpusCatalog } from '../corpus/catalog/corpusCatalog.js';

export function resolveCorpusFiles(rawName) {
    const corpus = CorpusCatalog.get(rawName);
    if (!corpus) return null;

    // Map all files in the corpus manifest to CorpusFile objects
    // Use the manifest from corpus instance
    return corpus.fileManifest.map(meta => {
        try {
            return new CorpusFile(corpus.name, meta.filename);
        } catch (e) {
            console.warn(`Skipping ${corpus.name}.${meta.filename}: ${e.message}`);
            return null;
        }
    }).filter(item => item !== null);
}

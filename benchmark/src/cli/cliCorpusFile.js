/**
 * benchmark/src/cli/cliCorpusFile.js
 * 
 * Logic to resolve a specific corpus file pattern (e.g. 'silesia.dickens').
 */

import { CorpusFile } from '../inputs/corpusFile.js';
import { CorpusCatalog } from '../corpus/catalog/corpusCatalog.js';

export function resolveCorpusFile(rawName) {
    if (!rawName) return null;

    // 1. Try Dot Notation: <corpus>.<file>
    const parts = rawName.split('.');

    if (parts.length >= 2) {
        // First part is potential corpus
        const corpusName = parts[0];
        const corpus = CorpusCatalog.get(corpusName);

        if (corpus) {
            const fileName = parts.slice(1).join('.');
            try {
                // CorpusFile constructor handles fuzzy matching of fileName within corpus
                return new CorpusFile(corpus.name, fileName);
            } catch (e) {
                // Valid corpus, invalid file
                return null;
            }
        }
    }

    // 2. Global fuzzy search? 
    // If just "dickens" is passed.
    // Iterating all corpora might be expensive or ambiguous. 
    // Preserving previous behavior: if user says 'dickens', we search.
    // But previous `inputUtils` fuzzy logic checked all keys.
    // Let's iterate catalogs.

    /*
    for (const corpus of CorpusCatalog.getAll()) {
        try {
            return new CorpusFile(corpus.name, rawName);
        } catch (e) {}
    }
    */

    return null;
}

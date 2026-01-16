/**
 * benchmark/inputs/corpusFile.js
 * 
 * Represents a single file from a specific Corpus.
 * Automatically resolves the file path using the CorpusCatalog.
 */

import path from 'path';
import { InputFile } from './inputFile.js';
import { CorpusCatalog } from '../corpus/catalog/corpusCatalog.js';

export class CorpusFile extends InputFile {
    /**
     * @param {string} corpusName - Name of the corpus (e.g., 'lz_flex', 'silesia'). Fuzzy matched.
     * @param {string} fileName - Name of the file (e.g., 'dickens', 'dickens.txt'). Fuzzy matched.
     */
    constructor(corpusName, fileName) {
        // 1. Resolve Corpus
        const corpus = CorpusCatalog.get(corpusName);
        if (!corpus) {
            throw new Error(`Corpus not found: '${corpusName}'`);
        }

        // 2. Resolve File Entry
        // Use manifest to find the file
        // We support fuzzy matching: 'dickens' matches 'dickens.txt' if strict match fails?
        // BaseCorpus.fileManifest has {filename}

        let targetFile = corpus.fileManifest.find(f => f.filename === fileName);

        // Fuzzy match: try standard extensions or partial match?
        if (!targetFile) {
            // Try matching without extension
            targetFile = corpus.fileManifest.find(f => {
                const base = path.basename(f.filename, path.extname(f.filename));
                return base === fileName;
            });
        }

        if (!targetFile) {
            throw new Error(`File '${fileName}' not found in corpus '${corpus.name}'`);
        }

        // 3. Construct Absolute Path
        // BaseCorpus provides cacheDir
        const absolutePath = path.join(corpus.cacheDir, targetFile.filename);

        // 4. Initialize InputFile
        super(absolutePath, corpus.name);

        // 5. Attach extra metadata
        this.corpusName = corpus.name;
        this.corpusEntry = targetFile;
        // Verify existence? InputFile usually checks fs.statSync in load(), but we can't assume load() is called immediately.
        // However, if corpus.exists() is false, we might want to warn or auto-cache? 
        // Consumers usually ensure cache first.
    }
}

/**
 * benchmark/src/bench/shared/benchConfigInputs.js
 * 
 * Manages the collection of inputs (Files/Corpora) for a benchmark run.
 */

import { resolveInputs } from './benchCLI.js';
import { InputFile } from '../../inputs/inputFile.js';
import { CorpusCatalog } from '../../corpus/catalog/corpusCatalog.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class BenchConfigInputs {
    /**
     * @param {Array<string|object>} [inputs=[]]
     * @param {Array<string>} [corpora=[]]
     */
    constructor(inputs = [], corpora = []) {
        /** @type {Array<InputFile>} */
        this.files = [];

        this.rawInputs = [];
        this.rawCorpora = [];

        if (inputs) {
            this.addInputs(inputs);
        }
        if (corpora) {
            this.addCorpora(corpora);
        }
    }

    /**
     * @param {string|Array} input 
     */
    addInputs(input) {
        const items = Array.isArray(input) ? input : [input];
        // Store raw strings
        items.forEach(i => {
            if (typeof i === 'string') this.rawInputs.push(i);
        });
        this._resolveAndAdd(items);
    }

    /**
     * @param {string|Array} corpus 
     */
    addCorpora(corpus) {
        const items = Array.isArray(corpus) ? corpus : [corpus];
        const processedItems = [];

        items.forEach(c => {
            if (typeof c === 'string') {
                this.rawCorpora.push(c);
                this._ensureCorpus(c);
            }
            processedItems.push(c);
        });

        this._resolveAndAdd(processedItems);
    }

    async _ensureCorpus(name) {
        const corpus = CorpusCatalog.get(name);
        if (!corpus) {
            console.warn(`Warning: Unknown corpus '${name}'. Skipping auto-cache.`);
            return;
        }

        if (corpus.exists()) return;

        console.log(`Corpus '${corpus.name}' missing or incomplete. Initiating auto-cache...`);
        try {
            await corpus.cache();
            console.log(`Auto-cache of '${corpus.name}' complete.`);
        } catch (e) {
            console.error(`Auto-cache failed for '${corpus.name}':`, e.message);
            process.exit(1);
        }
    }


    /**
     * Internal resolver
     */
    _resolveAndAdd(items) {
        // Separate strings for batch resolution vs Objects
        const stringNames = [];

        for (const item of items) {
            if (typeof item === 'string') {
                stringNames.push(item);
            } else if (item instanceof InputFile) {
                this.files.push(item);
            } else {
                console.warn('BenchConfigInputs: Unknown input type', item);
            }
        }

        if (stringNames.length > 0) {
            const resolved = resolveInputs(stringNames); // Uses shared CLI logic which handles expansion
            this.files.push(...resolved);
        }
    }

    /**
     * @returns {Array<InputFile>}
     */
    getFiles() {
        return this.files;
    }

    /**
     * @returns {string[]}
     */
    getFileNames() {
        return this.files.map(f => f.filename);
    }

    getRawInputs() { return this.rawInputs; }
    getRawCorpora() { return this.rawCorpora; }
}

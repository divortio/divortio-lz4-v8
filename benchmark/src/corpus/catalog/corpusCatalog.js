/**
 * benchmark/src/corpus/catalog/corpusCatalog.js
 * 
 * Central registry for all available benchmark corpora.
 */

import { CorpusSilesia } from './corpusSilesia.js';
import { CorpusLzFlex } from './corpusLzFlex.js';

class Catalog {
    constructor() {
        this.corpora = new Map();
        this.register(new CorpusSilesia());
        this.register(new CorpusLzFlex());
    }

    /**
     * Registers a corpus instance.
     * @param {import('../shared/baseCorpus.js').BaseCorpus} corpus 
     */
    register(corpus) {
        this.corpora.set(corpus.name.toLowerCase(), corpus);
    }

    /**
     * Retrieves a corpus by name.
     * @param {string} name 
     * @returns {import('../shared/baseCorpus.js').BaseCorpus|undefined}
     */
    get(name) {
        return this.corpora.get(name.toLowerCase());
    }

    /**
     * Returns all registered corpora.
     * @returns {Array<import('../shared/baseCorpus.js').BaseCorpus>}
     */
    getAll() {
        return Array.from(this.corpora.values());
    }
}

// Export a singleton instance
export const CorpusCatalog = new Catalog();

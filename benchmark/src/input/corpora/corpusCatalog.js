/**
 * benchmark/src/corpus/catalog/corpusCatalog.js
 *
 * Central registry for all available benchmark corpora.
 */

import {CorpusFiles} from "../file/corpusFiles.js";
import {CorpusSilesia} from "./corpus.silesia.js";
import {CorpusLZ4Flex} from "./corpus.lz4_flex.js";

/**
 * Normalizes a string for comparison by removing non-alphanumeric characters and lowercasing.
 * @param {string} str
 * @returns {string}
 */
const normalize = function(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};


class Catalog {

    /**
     *
     * @type {{silesia: CorpusSilesia, lz4_flex: CorpusLZ4Flex}}
     */
    corpora = {
        silesia: new CorpusSilesia(),
        lz4_flex: new CorpusLZ4Flex()
    };

    /**
     * @property _corpora
     * @type {[CorpusFiles]}
     * @private
     */
    _corpora = [this.corpora["silesia"],this.corpora["lz4_flex"]];

    /**
     *
     * @type {Map<string, CorpusFiles>}
     */
    map = new Map(Object.entries(this.corpora));

    /**
     *
     * @returns {CorpusFiles[]}
     */
    list() {
        return Object.values(this.corpora);
    }

    /**
     *
     * @returns {CorpusFiles[]}
     */
    getAll() {
        return this.list()
    }


    /**
     * Retrieves a corpus by name.
     * @param {string} name
     * @returns {CorpusFiles}
     */
    get(name) {
        return this.map.get(name.toLowerCase());
    }



    /**
     * Finds a matching key in the Corpus object using fuzzy logic.
     * e.g., 'lz4-flex' matches 'lz4_flex'
     * @param {string} name - The search term.
     * @returns {CorpusFiles | null}
     */
    findCorpus(name) {

        const target = normalize(name);
        const keys = Object.keys(this.corpora);

        // 1. Exact match
        if (this.corpora[name]) return this.map.get(name);

        if (this.corpora[name] === target) return this.map.get(name);

        // 2. Fuzzy match
        for (const key of keys) {
            const nKey = normalize(key);
            if (key === target || key === target || nKey === name || nKey === name) {
                return this.map.get(name.toLowerCase());
            }
        }
        return null;
    }

    /**
     *
     * @param name
     * @returns {InputFile}
     */
    findFile(name) {
        for (const corpus of this._corpora) {
            const result = corpus.findFile(name);
            if (result) return result;
        }
    }


}

// Export a singleton instance
export const CorpusCatalog = new Catalog();

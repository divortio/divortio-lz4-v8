/**
 * benchmark/src/cli/cliCorpusTar.js
 * 
 * Logic to resolve corpus references ending in .tar or .all to a CorpusTar input.
 */

import {CorpusTar} from "../../../input/file/corpusTar.js";
import {CorpusCatalog} from "../../../input/corpora/corpusCatalog.js";

/**
 *
 * @param rawName {string}
 * @returns {CorpusTar|null}
 */
export function resolveCorpusTar(rawName) {
    if (!rawName) return null;
    const lower = rawName.toLowerCase();

    // Check extensions
    let baseName = null;
    if (lower.endsWith('.tar')) {
        baseName = rawName.slice(0, -4);
    } else if (lower.endsWith('.all')) {
        baseName = rawName.slice(0, -4);
    }

    if (!baseName) return null;

    // Check if baseName is a valid corpus
    const corpus = CorpusCatalog.get(baseName);
    if (corpus) {
        return new CorpusTar(corpus.name);
    }

    return null;
}

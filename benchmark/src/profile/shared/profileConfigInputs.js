/**
 * benchmark/src/profile/shared/profileConfigInputs.js
 * 
 * Configuration for inputs (files/corpus) used in a profile command.
 * Reuses logic from benchConfigInputs.js where possible or delegates to benchCLI.
 */

import { resolveInputs } from '../../bench/shared/benchCLI.js';

export class ProfileConfigInputs {
    /**
     * @param {string[]} names - Array of input names/paths
     * @param {string[]} corpus - Array of corpus names
     */
    constructor(names = [], corpus = []) {
        // Resolve all inputs into a flat listCorpora of InputFile/CorpusFile objects
        // verify uniqueness?

        // combine raw input arguments
        const rawInputs = [...names, ...corpus];

        if (rawInputs.length === 0) {
            throw new Error("Profile requires input files or corpus (-i or -c)");
        }

        this.files = resolveInputs(rawInputs);
    }

    getFiles() {
        return this.files;
    }

    getFileNames() {
        return this.files.map(f => f.filename);
    }
}

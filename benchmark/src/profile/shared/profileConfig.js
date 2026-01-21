/**
 * benchmark/src/profile/shared/profileConfig.js
 * 
 * Configuration for a profile command.
 */

import { ProfileConfigLib } from './profileConfigLib.js';
import { ProfileConfigInputs } from './profileConfigInputs.js';

export class ProfileConfig {
    /**
     * @param {object} options
     * @param {string[]} options.libraries - Expected to be array, but we enforce single.
     * @param {string[]} options.inputs
     * @param {string[]} options.corpora
     * @param {number} options.samples
     * @param {number} options.warmups
     * @param {string} options.logFile
     * @param {string} options.diagnosticDir
     */
    constructor(options) {
        if (!options.libraries || options.libraries.length !== 1) {
            throw new Error("Profile command requires exactly one library (-l)");
        }

        this.lib = new ProfileConfigLib(options.libraries[0]);
        this.inputs = new ProfileConfigInputs(options.inputs, options.corpora);

        this.samples = options.samples || 5;
        this.warmups = options.warmups || 2;

        // Profile-specific overrides
        this.logFileOverride = options.logFile;
        this.diagnosticDirOverride = options.diagnosticDir;

        // Output format (default to human-readable/txt, allow json)
        this.format = 'human';
        if (options.formats && options.formats.includes('json')) {
            this.format = 'json';
        }

        this.meta = options.meta || false;
        this.metaMd = options.metaMd || false;
    }

    toJSON() {
        return {
            library: this.lib.lib, // The BaseLib instance
            inputs: this.inputs.getFiles(), // Array of InputFile instances
            samples: this.samples,
            warmups: this.warmups
        };
    }
}

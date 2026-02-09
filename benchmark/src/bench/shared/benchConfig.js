/**
 * benchmark/src/bench/shared/benchConfig.js
 * 
 * Master configuration for a benchmark listLibs.
 * Aggregates Libraries, Inputs, and Runtime Settings.
 */

import { BenchConfigLibs } from './benchConfigLibs.js';
import { BenchConfigInputs } from './benchConfigInputs.js';


export class BenchConfig {
    /**
     * @param {BenchConfigLibs|Array} [libs]
     * @param {BenchConfigInputs|Array} [inputs]
     * @param {number} [samples=10]
     * @param {number} [warmups=5]
     * @param {object} [options={}]
     */
    constructor(libs, inputs, samples = 5, warmups = 2, options = {}) {
        this.libs = libs instanceof BenchConfigLibs ? libs : new BenchConfigLibs(libs);
        this.inputs = inputs instanceof BenchConfigInputs ? inputs : new BenchConfigInputs(inputs);
        this.samples = samples;
        this.warmups = warmups;
        this.options = options;
    }

    /**
     * @returns {{libs: string[], inputs: string[], samples: number, warmups: number, options: Object}} Simple object representation for JSON.
     */
    toJSON() {
        return {
            libs: this.libs.getNames(),
            inputs: this.inputs.getFileNames(),
            samples: this.samples,
            warmups: this.warmups,
            options: this.options
        };
    }
    /**
     * Reconstructs the CLI arguments string.
     * @returns {string}
     */
    /**
     * Returns the CLI arguments as an array of strings.
     * @returns {string[]}
     */
    getCLIParts() {
        const parts = [];

        // Libraries
        const libNames = this.libs.getNames();
        for (const name of libNames) {
            parts.push(`--library ${name}`);
        }

        // Inputs
        // Inputs & Corpora
        const rawCorpora = this.inputs.getRawCorpora();
        const rawInputs = this.inputs.getRawInputs();

        if (rawCorpora.length > 0 || rawInputs.length > 0) {
            for (const c of rawCorpora) {
                parts.push(`--corpus "${c}"`);
            }
            for (const i of rawInputs) {
                parts.push(`--input "${i}"`);
            }
        } else {
            // Fallback: Reconstruct from resolved files (legacy/programmatic objects)
            const inputFiles = this.inputs.getFiles();
            for (const f of inputFiles) {
                let arg = f.path;
                if (f.corpusName && f.corpusName !== 'FILE' && f.filename) {
                    arg = `${f.corpusName}.${f.filename}`;
                }
                parts.push(`--input "${arg}"`);
            }
        }

        // Settings
        parts.push(`--samples ${this.samples}`);
        parts.push(`--warmups ${this.warmups}`);

        // Misc
        for (const [key, val] of Object.entries(this.options)) {
            parts.push(`--${key} ${val}`);
        }

        return parts;
    }

    /**
     * Reconstructs the CLI arguments string.
     * @returns {string}
     */
    getCLIString() {
        return this.getCLIParts().join(' ');
    }
}

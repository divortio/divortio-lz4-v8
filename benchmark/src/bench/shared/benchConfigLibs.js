/**
 * benchmark/src/bench/shared/benchConfigLibs.js
 * 
 * Manages the collection of libraries for a benchmark run.
 */

import { resolveLibrary } from '../../cli/cliLibs.js';

export class BenchConfigLibs {
    /**
     * @param {Array<string|object>} [libs=[]] - Array of library names or instances.
     */
    constructor(libs = []) {
        /** @type {Array<{name: string, library: object}>} */
        this.libs = [];

        if (libs) {
            this.add(libs);
        }
    }

    /**
     * Adds libraries to the configuration.
     * @param {string|object|Array<string|object>} input 
     */
    add(input) {
        const items = Array.isArray(input) ? input : [input];

        for (const item of items) {
            if (typeof item === 'string') {
                // Resolve from string name
                const libInstance = resolveLibrary(item);
                this.libs.push({ name: item, library: libInstance });
            } else if (typeof item === 'object' && item !== null) {
                // Assume it's a BaseLib instance or { name, library } wrapper
                if (item.library && item.name) {
                    this.libs.push(item);
                } else {
                    // TODO: How to get name if just passed instance? 
                    // BaseLib usually implies metadata is extrinsic or we default to class name.
                    // For now, let's require explicit structure or string.
                    // Fallback: use constructor name?
                    const name = item.constructor.name || 'UnknownLib';
                    this.libs.push({ name: name, library: item });
                }
            }
        }
    }

    /**
     * @returns {Array<{name: string, library: object}>}
     */
    getLibraries() {
        return this.libs;
    }

    /**
     * @returns {string[]}
     */
    getNames() {
        return this.libs.map(l => l.name);
    }
}

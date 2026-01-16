/**
 * benchmark/inputs/inputFiles.js
 * 
 * Collection class for managing multiple InputFile instances.
 * Iterable: can be used in for...of loops.
 */

import { InputFile } from './inputFile.js';

export class InputFiles {
    constructor() {
        /** @type {InputFile[]} */
        this._files = [];
    }

    /**
     * Adds an InputFile to the collection.
     * @param {InputFile} file 
     */
    add(file) {
        if (!(file instanceof InputFile)) {
            throw new Error('Invalid argument: Must be an instance of InputFile');
        }
        this._files.push(file);
    }

    /**
     * Number of files in the collection.
     * @returns {number}
     */
    get count() {
        return this._files.length;
    }

    /**
     * Returns an array of all files.
     * @returns {InputFile[]}
     */
    get all() {
        return [...this._files];
    }

    /**
     * Total size of all files in bytes.
     * @returns {number}
     */
    get totalSize() {
        return this._files.reduce((sum, f) => sum + f.size, 0);
    }

    /**
     * Iterator implementation.
     */
    *[Symbol.iterator]() {
        for (const file of this._files) {
            yield file;
        }
    }
}

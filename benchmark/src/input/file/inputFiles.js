/**
 * benchmark/inputs/inputFiles.js
 * 
 * Collection class for managing multiple InputFile instances.
 * Iterable: can be used in for...of loops.
 */

import { InputFile } from './inputFile.js';

/**
 * Normalizes a string for comparison by removing non-alphanumeric characters and lowercasing.
 * @param {string} str
 * @returns {string}
 */
const normalize = function(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};


/**
 * @class InputFiles
 */
export class InputFiles {

    /**
     *
     * @type {Map<string, InputFile>}
     */
    map = new Map();

    /**
     *
     * @type {InputFile[]}
     */
    _files;

    /**
     * @type {string}
     */
    corpus;

    /**
     * @type {string}
     */
    description;

    /**
     * @type {string}
     */
    url;

    /**
     *
     * @param  {InputFile[] | []} [files=[]]
     * @param  {string} [corpus='FILES']
     * @param  {string|null} [description=null]
     * @param  {string|null} [url=null]
     */
    constructor(files=[],
                corpus='FILES',
                description=null,
                url=null
    ) {
        this.corpus = corpus || this.corpus;
        this.description = description || this.description;
        this.url = url || this.url;
        if (Array.isArray(files) && files.length > 0) {
            for (const file of files) {
               this.add(file)
            }
        }
    }
    /**
     * Adds an InputFile to the collection.
     * @param {InputFile} file
     * @return {InputFile}
     */
    add(file) {
        if (!(file instanceof InputFile)) {
            throw new Error('Invalid argument: Must be an instance of InputFile');
        }
        this._files.push(file);
        this.map.set(file.filename, file );
        return file;
    }

    /**
     *
     * @returns {boolean}
     */
    _exists() {
        if (Array.isArray(this._files) && this._files.length > 0) {
            for (const file of this._files) {
                if (file.exists === false) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    /**
     *
     * @return {boolean}
     */
    cache() {
        return false;
    }

    /**
     * @type {boolean}
     * @return {boolean}
     */
    get exists() {
        const exists = this._exists();
        if (exists) {
            return true;
        } else {
            return this.cache();
        }
    }


    /**
     * Number of files in the collection.
     * @returns {number}
     */
    get length() {
        return this._files.length;
    }

    /**
     * Returns an array of all files.
     * @returns {InputFile[]}
     */
    get files() {
        return [...this._files];
    }

    /**
     * Total size of all files in bytes.
     * @returns {number}
     */
    get size() {
        return this._files.reduce((sum, f) => sum + f.size, 0);
    }

    /**
     * @returns {string}
     */
    get sizeH() {
        return this._formatBytes(this.size);
    }

    /**
     * Formatter helper.
     * @param {number} bytes
     * @returns {string}
     * @private
     */
    _formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Finds a matching key in the Corpus object using fuzzy logic.
     * e.g., 'lz4-flex' matches 'lz4_flex'
     * @param {string} name - The search term.
     * @returns {InputFile | null}
     */
    findFile(name) {
        if (!name || !this._files) return null;

        const target = normalize(name);
        const keys = Object.keys(this.map);

        // 1. Exact match
        if (this.map[name]) return this.map.get(name);

        if (this.map[name] === target) return this.map.get(target);

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
     * Iterator implementation.
     * @return {Generator<InputFile>}
     */
    *[Symbol.iterator]() {
        for (const file of this._files) {
            yield file;
        }
    }
}

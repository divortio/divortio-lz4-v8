/**
 * benchmark/src/corpus/shared/baseCorpus.js
 * 
 * Abstract Base Class for Benchmark Corpora.
 * Defines the contract for dataset caching, validation, and file enumeration.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Central Cache Directory
export const CACHE_DIR = path.resolve(__dirname, '../../../../.cache/corpus');

export class BaseCorpus {
    /**
     * @param {object} metadata
     * @param {string} metadata.name - Unique slug (e.g. 'silesia')
     * @param {string} metadata.url - Source URL
     * @param {string} metadata.description - Human readable description
     * @param {Array<{filename: string, size: number}>} metadata.files - List of expected files
     */
    constructor({ name, url, description, files }) {
        this.name = name;
        this.url = url;
        this.description = description;
        this.fileManifest = files || [];

        this.cacheDir = path.join(CACHE_DIR, this.name);
    }

    /**
     * Checks if the corpus is fully cached and valid.
     * @returns {boolean}
     */
    exists() {
        if (!fs.existsSync(this.cacheDir)) return false;

        // Check each file in valid manifest
        for (const fileMeta of this.fileManifest) {
            const filePath = path.join(this.cacheDir, fileMeta.filename);
            if (!fs.existsSync(filePath)) return false;

            // Optional: Check size if strict
            const stats = fs.statSync(filePath);
            if (fileMeta.size && stats.size !== fileMeta.size) {
                // Size mismatch? invalid.
                return false;
            }
        }
        return true;
    }

    /**
     * Downloads and caches the corpus. 
     * Must be implemented by subclasses or use shared helpers.
     */
    async cache() {
        throw new Error(`${this.name} must implement cache()`);
    }

    /**
     * Returns a list of InputFile-like objects for the corpus.
     * @returns {Array<{path: string, name: string, corpusName: string, size: number}>}
     */
    get files() {
        if (!this.exists()) {
            throw new Error(`Corpus ${this.name} is not cached. Run cache() first.`);
        }

        return this.fileManifest.map(meta => ({
            path: path.join(this.cacheDir, meta.filename),
            name: meta.filename,
            corpusName: this.name,
            size: meta.size
        }));
    }
}

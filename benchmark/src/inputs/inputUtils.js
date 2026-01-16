/**
 * benchmark/inputs/inputUtils.js
 * 
 * Helper functions for finding corpus keys and file entries using fuzzy matching.
 */

/**
 * Normalizes a string for comparison by removing non-alphanumeric characters and lowercasing.
 * @param {string} str 
 * @returns {string}
 */
function normalize(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds a matching key in the Corpus object using fuzzy logic.
 * e.g., 'lz-flex' matches 'lz_flex'
 * @param {string} name - The search term.
 * @param {object} corpusObject - The master Corpus object.
 * @returns {string|null} The actual key if found, or null.
 */
export function findCorpusKey(name, corpusObject) {
    if (!name || !corpusObject) return null;

    const target = normalize(name);
    const keys = Object.keys(corpusObject);

    // 1. Exact match
    if (corpusObject[name]) return name;

    // 2. Fuzzy match
    for (const key of keys) {
        if (normalize(key) === target) {
            return key;
        }
    }

    return null;
}

/**
 * Finds a specific file entry within a corpus using fuzzy logic.
 * Matches full filename first, then tries to match by name (without extension).
 * @param {string} name - Filename or name (e.g., 'dickens' or 'dickens.txt').
 * @param {object} corpusData - The corpus data object (e.g., LZFlexCorpus).
 * @returns {object|null} The file metadata object if found, or null.
 */
export function findCorpusFileEntry(name, corpusData) {
    if (!name || !corpusData) return null;

    // 1. Exact Key Match (usually the filename)
    if (corpusData[name]) return corpusData[name];

    // 2. Iterate and check 'name' or 'filename' properties
    const entries = Object.values(corpusData);
    const target = normalize(name);

    for (const entry of entries) {
        // Check exact name match (preferred)
        if (entry.name === name) return entry;
        if (entry.filename === name) return entry;

        // Check fuzzy
        if (normalize(entry.name) === target) return entry;
        if (normalize(entry.filename) === target) return entry;
    }

    return null;
}

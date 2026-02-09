/**
 * benchmark/src/cli/cliLibs.js
 * 
 * Central handler for Library resolution and CLI operations.
 * Handles parsing, alias resolution, and catalog lookups for libraries.
 */

// Import Library Catalogs
import { V8JSLibs } from '../../libraries/libs/libs.v8JS.js';
import { NodeJSLibs } from '../../libraries/libs/libs.nodeJS.js';
import { V8WASMLibs } from '../../libraries/libs/libs.v8WASM.js';

/**
 * Resolves a library string to a BenchLib instance.
 * Supports dot notation (v8.js.pako) and aliases.
 * @param {string} rawName 
 * @returns {object} The BenchLib instance (wrapper).
 */
export function resolveLibrary(rawName) {
    if (!rawName) throw new Error("Library name is required (-l)");

    // Normalize input
    // v8js -> v8.js, v8wasm -> v8.wasm, nodejs -> node.js
    let name = rawName.toLowerCase();

    // Quick aliases replacements
    name = name.replace(/^v8js/, 'v8.js');
    name = name.replace(/^v8wasm/, 'v8.wasm');
    name = name.replace(/^nodejs/, 'node'); // matches 'node.js' or 'node'
    name = name.replace(/^node\.js/, 'node');

    const parts = name.split('.');

    // Structure mapping
    // v8.js.* -> V8JSLibs
    // v8.wasm.* -> V8WASMLibs
    // node.* -> NodeJSLibs

    let catalog = null;
    let libKey = null;

    if (parts[0] === 'v8') {
        if (parts[1] === 'js' || parts[1] === 'javascript') {
            catalog = V8JSLibs;
            libKey = parts[2];
        } else if (parts[1] === 'wasm') {
            catalog = V8WASMLibs;
            libKey = parts[2];
        }
    } else if (parts[0] === 'node') {
        catalog = NodeJSLibs;
        libKey = parts[1];
    }

    // Fallback: Try to find key in all catalogs if no prefix matches clearly
    if (!catalog) {
        // Simple search (user provided just 'pako' or 'lz4Divortio')
        const target = parts[parts.length - 1]; // last part

        // Helper to search case-insensitive
        const search = (cat) => {
            const keys = Object.keys(cat);
            // Robust matching: strip hyphens/underscores/dots?
            // Actually target (parts[last]) might already be stripped of dots by split?
            // normalize: lower case, remove - and _
            const normalize = (s) => s.toLowerCase().replace(/[-_]/g, '');
            const targetNorm = normalize(target);

            const found = keys.find(k => normalize(k) === targetNorm);
            // Unwrap BenchLib to get the actual BaseLib instance
            return found ? cat[found].class : null;
        };

        if (search(V8JSLibs)) return search(V8JSLibs);
        if (search(NodeJSLibs)) return search(NodeJSLibs);
        if (search(V8WASMLibs)) return search(V8WASMLibs);
    }

    if (catalog && libKey) {
        // Case-insensitive lookup in specific catalog
        const keys = Object.keys(catalog);
        const normalize = (s) => s.toLowerCase().replace(/[-_]/g, '');
        const targetNorm = normalize(libKey);
        const foundKey = keys.find(k => normalize(k) === targetNorm);
        // Unwrap BenchLib to get the actual BaseLib instance
        if (foundKey) return catalog[foundKey].class;
    }

    throw new Error(`Library not found: ${rawName}\nHint: Run 'node benchmark/bench.js libs' to see available libraries.`);
}

/**
 * Resolves a listCorpora of library names to an array of { name, library } objects.
 * @param {string[]} rawNames
 * @returns {Array<{name: string, library: object}>}
 */
export function resolveLibraries(rawNames) {
    if (!rawNames || rawNames.length === 0) {
        throw new Error("No libraries specified (-l)");
    }
    const results = [];
    // Deduplicate? Maybe user wants to listLibs twice.
    // Let's keep distinct entries.
    for (const name of rawNames) {
        const libInstance = resolveLibrary(name);
        results.push({ name: name, library: libInstance });
    }
    return results;
}

/**
 * benchmark/src/bench/shared/benchLibCatalog.js
 * 
 * Central catalog of available benchmark libraries.
 * Provides filtering and aggregation logic.
 */

import { V8JSLibs } from '../../libraries/libs/libs.v8JS.js';
import { NodeJSLibs } from '../../libraries/libs/libs.nodeJS.js';
import { V8WASMLibs } from '../../libraries/libs/libs.v8WASM.js';

/**
 * Returns a flat listCorpora of all libraries with metadata.
 * @returns {Array<{name: string, rawName: string, object: object, env: string, lang: string}>}
 */
export function getAllLibraries() {
    const allLibs = [];

    // Keys in filtered output need to be usable by the CLI (-l argument)

    // V8 JS
    for (const [key, val] of Object.entries(V8JSLibs)) {
        allLibs.push({
            name: `v8.js.${key}`,
            rawName: key,
            object: val,
            env: 'V8',
            lang: 'JS'
        });
    }

    // V8 WASM
    for (const [key, val] of Object.entries(V8WASMLibs)) {
        allLibs.push({
            name: `v8.wasm.${key}`,
            rawName: key,
            object: val,
            env: 'V8',
            lang: 'WASM'
        });
    }

    // Node
    for (const [key, val] of Object.entries(NodeJSLibs)) {
        allLibs.push({
            name: `node.${key}`, // or node.js.key? benchCLI.js handled node.* mapping to NodeJSLibs
            rawName: key,
            object: val,
            env: 'Node',
            lang: 'JS'
        });
    }

    return allLibs;
}

/**
 * Filters libraries based on criteria.
 * @param {object} criteria
 * @param {string} [criteria.env] - Environment filter (substring/smart match)
 * @param {string} [criteria.lang] - Language filter (substring/smart match)
 * @param {string} [criteria.pattern] - Name wildcard/literal pattern
 * @returns {Array<string>} List of library names (CLI compatible)
 */
export function filterLibraries(criteria = {}) {
    const libs = getAllLibraries();

    const normalize = (s) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

    const matchEnv = (libEnv, filterEnv) => {
        if (!filterEnv) return true;
        const normLib = normalize(libEnv);
        const normFilter = normalize(filterEnv);
        if (normFilter === 'nodejs') return normLib === 'node';
        if (normFilter === 'browser') return normLib === 'v8';
        return normLib.includes(normFilter);
    };

    const matchLang = (libLang, filterLang) => {
        if (!filterLang) return true;
        const normLib = normalize(libLang);
        const normFilter = normalize(filterLang);
        if (normFilter === 'javascript') return normLib === 'js';
        return normLib.includes(normFilter);
    };

    const matchName = (libName, pattern) => {
        if (!pattern) return true;
        if (pattern.includes('*') || pattern.includes('%')) {
            const regexStr = pattern.replace(/%/g, '.*').replace(/\*/g, '.*');
            const regex = new RegExp(`^${regexStr}$`, 'i');
            return regex.test(libName);
        } else {
            return libName.toLowerCase() === pattern.toLowerCase();
        }
    };

    return libs.filter(lib => {
        const envOk = matchEnv(lib.env, criteria.env);
        const langOk = matchLang(lib.lang, criteria.lang);
        const nameOk = matchName(lib.name, criteria.pattern);
        return envOk && langOk && nameOk;
    }).map(l => l.name);
}

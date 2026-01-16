/**
 * benchmark/src/cli/cliListLibs.js
 * 
 * Lists available libraries with filtering capabilities.
 */

import { getAllLibraries } from '../bench/shared/benchLibCatalog.js';

export function run(args) {
    // 1. Collect all libraries
    const allLibs = getAllLibraries();

    // 2. Filter

    // Extract positional filter
    const filterName = (args.unknown && args.unknown.length > 0) ? args.unknown[0] : null;

    // Helper: Smart Match Env/Lang
    const normalize = (s) => s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const matchEnv = (libEnv, filterEnv) => {
        if (!filterEnv) return true;
        const normLib = normalize(libEnv);
        const normFilter = normalize(filterEnv);
        // Special cases
        if (normFilter === 'nodejs') return normLib === 'node';
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
            // Wildcard
            const regexStr = pattern
                .replace(/%/g, '.*')
                .replace(/\*/g, '.*');
            const regex = new RegExp(`^${regexStr}$`, 'i');
            return regex.test(libName);
        } else {
            // Literal (Case insensitive?)
            return libName.toLowerCase() === pattern.toLowerCase();
        }
    };

    const filtered = allLibs.filter(lib => {
        const envOk = matchEnv(lib.env, args.filterEnvironment);
        const langOk = matchLang(lib.lang, args.filterLanguage);
        const nameOk = matchName(lib.name, filterName);
        return envOk && langOk && nameOk;
    });

    if (filtered.length === 0) {
        console.log('No libraries found matching filters.');
        return;
    }

    // 3. Sort
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    // 4. Print
    console.log(`Found ${filtered.length} libraries:`);
    console.log('');

    const pad = (s, len) => s.padEnd(len, ' ');
    const maxName = Math.max(...filtered.map(l => l.name.length), 4) + 2;
    const maxEnv = 10;
    const maxLang = 10;

    console.log(`${pad('Name', maxName)} ${pad('Env', maxEnv)} ${pad('Lang', maxLang)}`);
    console.log(`${'-'.repeat(maxName)} ${'-'.repeat(maxEnv)} ${'-'.repeat(maxLang)}`);

    for (const lib of filtered) {
        console.log(`${pad(lib.name, maxName)} ${pad(lib.env, maxEnv)} ${pad(lib.lang, maxLang)}`);
    }
}

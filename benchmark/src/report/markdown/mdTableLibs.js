/**
 * benchmark/src/report/markdown/mdTableLibs.js
 * 
 * Generates a markdown table for Libraries.
 */

import { generateTable, sortData } from './mdTableBase.js';

const DEFAULT_COLUMNS = [
    { header: 'Environment', key: 'environment' },
    { header: 'Language', key: 'language' },
    { header: 'Package', key: 'package' },
    { header: 'Library', key: 'name' }
];

/**
 * Returns a markdown table for BenchConfigLibs.
 * @param {BenchConfigLibs} libsConfig 
 * @param {Array} [columns=DEFAULT_COLUMNS] 
 * @param {string} [sortField='name'] 
 * @param {'asc'|'desc'} [sortDirection='asc']
 * @returns {string}
 */
export function generateLibsTable(libsConfig, columns = DEFAULT_COLUMNS, sortField = 'name', sortDirection = 'asc') {
    if (!libsConfig) return '';

    const libs = libsConfig.getLibraries(); // Array of { name, library }

    // Flatten for table generation
    // The wrapper has { name, library: BenchLib }
    // BenchLib has { environment, language, name, package, ... }
    const rows = libs.map(item => ({
        name: item.name,
        package: item.library.package || 'Unknown',
        environment: item.library.environment || 'Unknown',
        language: item.library.language || 'Unknown'
    }));

    const sorted = sortData(rows, sortField, sortDirection);

    return generateTable(sorted, columns);
}

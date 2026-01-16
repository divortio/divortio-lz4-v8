/**
 * benchmark/src/report/markdown/mdTableConfig.js
 * 
 * Generates a markdown table for Benchmark Configuration.
 */

import { generateKeyValueTable, sortData } from './mdTableBase.js';

/**
 * Returns a markdown table for BenchConfig.
 * @param {BenchConfig} config 
 * @param {Array<{header: string, key: string}>} [columns] - Not used for KV table really, but kept for signature consistency? 
 * Actually, for Config, a KV table is best. Let's ignore columns arg for KV mode or strictly assume keys.
 * @param {string} [sortField] 
 * @param {'asc'|'desc'} [sortDirection='asc']
 * @returns {string}
 */
export function generateConfigTable(config, columns = null, sortField = null, sortDirection = 'asc') {
    if (!config) return '';

    const flatConfig = {
        'Samples': config.samples,
        'Warmups': config.warmups,
        'Libraries': config.libs.getNames().join(', '),
        'Inputs': config.inputs.getFileNames().join(', '),
        ...config.misc
    };

    // If sortField is provided, we might be sorting the KEYS of the config? 
    // Usually config is static.

    return generateKeyValueTable(flatConfig, 'Configuration Setting', 'Value');
}

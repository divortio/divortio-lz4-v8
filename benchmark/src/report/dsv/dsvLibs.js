/**
 * benchmark/src/report/dsv/dsvLibs.js
 */

import { generateDSV, sortData } from './dsvBase.js';

const DEFAULT_COLUMNS = [
    { header: 'name', key: 'name' }
];

export function generateLibsDSV(libsConfig, columns = DEFAULT_COLUMNS, options = {}) {
    if (!libsConfig) return '';

    const libs = libsConfig.getLibraries();

    // Flatten
    const rows = libs.map(item => ({
        name: item.name,
        package: item.library.package || 'Unknown',
        environment: item.library.environment || 'Unknown',
        language: item.library.language || 'Unknown'
    }));

    const sorted = sortData(rows, 'name', 'asc');

    return generateDSV(sorted, columns, options);
}

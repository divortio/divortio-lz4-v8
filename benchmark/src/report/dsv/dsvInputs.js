/**
 * benchmark/src/report/dsv/dsvInputs.js
 */

import { generateDSV, sortData } from './dsvBase.js';

const DEFAULT_COLUMNS = [
    { header: 'filename', key: 'filename' },
    { header: 'filePath', key: 'filePath' }
];

export function generateInputsDSV(inputsConfig, columns = DEFAULT_COLUMNS, options = {}) {
    if (!inputsConfig) return '';

    const files = inputsConfig.getFiles();
    const sorted = sortData(files, 'filename', 'asc');

    return generateDSV(sorted, columns, options);
}

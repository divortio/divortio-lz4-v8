/**
 * benchmark/src/report/markdown/mdTableInputs.js
 * 
 * Generates a markdown table for Input Files.
 */

import { generateTable, sortData } from './mdTableBase.js';

const DEFAULT_COLUMNS = [
    { header: 'Corpus', key: 'corpusName' },
    { header: 'Filename', key: 'filename' },
    { header: 'Size', key: 'sizeH' }
];

/**
 * Returns a markdown table for BenchConfigInputs.
 * @param {BenchConfigInputs} inputsConfig 
 * @param {Array} [columns=DEFAULT_COLUMNS] 
 * @param {string} [sortField='filename'] 
 * @param {'asc'|'desc'} [sortDirection='asc']
 * @returns {string}
 */
export function generateInputsTable(inputsConfig, columns = DEFAULT_COLUMNS, sortField = 'filename', sortDirection = 'asc') {
    if (!inputsConfig) return '';

    const files = inputsConfig.getFiles(); // Array of InputFile objects
    const sorted = sortData(files, sortField, sortDirection);

    return generateTable(sorted, columns);
}

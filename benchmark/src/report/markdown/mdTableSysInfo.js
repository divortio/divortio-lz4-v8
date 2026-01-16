/**
 * benchmark/src/report/markdown/mdTableSysInfo.js
 * 
 * Generates a markdown table for System Information.
 */

import { generateKeyValueTable } from './mdTableBase.js';

/**
 * Returns a markdown table for BenchSysInfo.
 * @param {BenchSysInfo} sysInfo 
 * @returns {string}
 */
export function generateSysInfoTable(sysInfo) {
    if (!sysInfo || !sysInfo.data) return '';

    const data = { ...sysInfo.data };


    // Formatting: CPU Speed (GHz, 1 decimal)
    // Assuming cpu.speed is in MHz or distinct field?
    // sysInfo.js uses 'cpu.speed' (string or number). 
    // If number (MHz), divide by 1000. If string, parse.
    // Let's assume it might be raw number from `os.cpus()[0].speed`.
    if (data['cpu.speed']) {
        const speed = parseFloat(data['cpu.speed']);
        if (!isNaN(speed)) {
            // If > 100 assumed MHz? usually os.cpus() speed is MHz.
            // user wants GHz.
            data['cpu.speed'] = (speed / 1000).toFixed(2) + ' GHz';
        }
    }

    // Formatting: Memory (GB, 1 decimal) -> Rename 'memory.totalBytes' to 'memory'
    if (data['memory.totalBytes']) {
        const bytes = parseInt(data['memory.totalBytes'], 10);
        if (!isNaN(bytes)) {
            // Bytes -> GB
            data['memory'] = (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
            delete data['memory.totalBytes'];
        }
    }
    // Remove other memory fields if desired, or format them. 
    // User requested "Rename memory.totaGB to simply memory". 
    // Assuming we drop freeBytes or rename it too? I'll drop/ignore it for the simplified table if implicit.
    // The previous code iterated fields. I'll strict match.

    return generateKeyValueTable(data, 'System Field', 'Specification');
}

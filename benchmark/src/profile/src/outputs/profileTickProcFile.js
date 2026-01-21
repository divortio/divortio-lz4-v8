/**
 * benchmark/src/profile/src/outputs/profileTickProcFile.js
 * 
 * Represents a processed V8 profile (output of --prof-process).
 */

import { ProfileFile } from './profileFile.js';

export class ProfileTickProcFile extends ProfileFile {
    /**
     * @param {string} dir 
     * @param {string} libName 
     * @param {number} timestamp 
     */
    /**
     * @param {string} dir 
     * @param {string} libName 
     * @param {number} timestamp 
     * @param {string} format - 'json' or 'human'
     */
    constructor(dir, libName, timestamp, format = 'human') {
        // Syntax: profTickProc_${libName}_${startTimestamp}.v8.log[.json]
        let filename = `profTickProc_${libName}_${timestamp}.v8.log`;
        if (format === 'json') {
            filename += '.json';
        }
        super(dir, filename);
        this.libName = libName;
        this.timestamp = timestamp;
        this.format = format;
    }
}

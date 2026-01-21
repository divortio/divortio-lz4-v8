/**
 * benchmark/src/profile/src/outputs/profileTickFile.js
 * 
 * Represents a V8 tick log file (output of --prof).
 */

import { ProfileFile } from './profileFile.js';

export class ProfileTickFile extends ProfileFile {
    /**
     * @param {string} dir 
     * @param {string} libName 
     * @param {number} timestamp 
     */
    constructor(dir, libName, timestamp) {
        // Syntax: profTick_${libName}_${startTimestamp}.v8.log
        const filename = `profTick_${libName}_${timestamp}.v8.log`;
        super(dir, filename);
        this.libName = libName;
        this.timestamp = timestamp;
    }
}

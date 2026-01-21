/**
 * benchmark/src/profile/src/outputs/profileTickProcJsonFile.js
 * 
 * Represents the Processed Profile JSON file.
 */

import { ProfileFile } from './profileFile.js';

export class ProfileTickProcJsonFile extends ProfileFile {
    constructor(dir, libName, timestamp) {
        const filename = `profTickProcJson_${libName}_${timestamp}.json`;
        super(dir, filename);
        this.libName = libName;
        this.timestamp = timestamp;
    }
}

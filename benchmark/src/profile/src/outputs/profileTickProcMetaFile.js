/**
 * benchmark/src/profile/src/outputs/profileTickProcMetaFile.js
 * 
 * Represents the Profile Meta Analysis File (.meta.json).
 */

import fs from 'fs';
import { ProfileFile } from './profileFile.js';

export class ProfileTickProcMetaFile extends ProfileFile {
    constructor(dir, libName, timestamp) {
        const filename = `profTickProcMeta_${libName}_${timestamp}.meta.json`;
        super(dir, filename);
    }

    /**
     * @param {object} insights 
     */
    write(insights) {
        const data = JSON.stringify(insights, null, 2);
        fs.writeFileSync(this.path, data);
    }
}

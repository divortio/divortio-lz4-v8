/**
 * benchmark/src/profile/src/outputs/profileFile.js
 * 
 * Base class for profile output files.
 */

import path from 'path';
import fs from 'fs';

export class ProfileFile {
    /**
     * @param {string} dir
     * @param {string} filename 
     */
    constructor(dir, filename) {
        this.dir = dir;
        this.filename = filename;
    }

    get path() {
        return path.join(this.dir, this.filename);
    }

    exists() {
        return fs.existsSync(this.path);
    }

    ensureDir() {
        if (!fs.existsSync(this.dir)) {
            fs.mkdirSync(this.dir, { recursive: true });
        }
    }
}

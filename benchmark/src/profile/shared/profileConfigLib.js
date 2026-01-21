/**
 * benchmark/src/profile/shared/profileConfigLib.js
 * 
 * Configuration for the single library used in a profile command.
 */

import { resolveLibrary } from '../../cli/cliLibs.js';

export class ProfileConfigLib {
    /**
     * @param {string} name 
     */
    constructor(name) {
        if (!name) {
            throw new Error("Profile requires exactly one library (-l)");
        }
        
        // Use resolveLibrary from cliLibs to get the full library object
        // This ensures alias support is consistent with benchmark CLI
        this.lib = resolveLibrary(name);
    }

    get name() {
        return this.lib.name;
    }

    get path() {
        return this.lib.path;
    }
    
    // For directory naming, we use style matching user request: libraryFileNameAsDirName
    // But library object might not expose filename directly if it's just a path.
    // However, resolveLibrary returns { name, source, path }. 
    // We can derive a safe dir name from the name.
    get safeName() {
        return this.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    }
}

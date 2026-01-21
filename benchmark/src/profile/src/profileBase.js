/**
 * benchmark/src/profile/src/profileBase.js
 * 
 * Base class for profile operations.
 */

export class ProfileBase {
    /**
     * @param {string} libraryName 
     * @param {object} config - ProfileConfig
     */
    constructor(libraryName, config) {
        this.libraryName = libraryName;
        this.config = config;
        this.startTimestamp = Date.now();
        this.endTimestamp = null;
    }

    run() {
        throw new Error("Generic ProfileBase.run() called.");
    }
}

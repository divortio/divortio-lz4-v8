/**
 * benchmark/src/result/profile/profileRoundtripResult.js
 */

import { ProfileResult } from './profileResult.js';

export class ProfileRoundtripResult extends ProfileResult {
    constructor(libraryName, inputSize, durationMs, tickLogPath, processedLogPath) {
        super(libraryName, 'roundtrip', inputSize, durationMs, tickLogPath, processedLogPath);
    }
}

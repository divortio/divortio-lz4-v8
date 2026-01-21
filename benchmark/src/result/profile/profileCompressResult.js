/**
 * benchmark/src/result/profile/profileCompressResult.js
 */

import { ProfileResult } from './profileResult.js';

export class ProfileCompressResult extends ProfileResult {
    constructor(libraryName, inputSize, durationMs, tickLogPath, processedLogPath) {
        super(libraryName, 'compress', inputSize, durationMs, tickLogPath, processedLogPath);
    }
}

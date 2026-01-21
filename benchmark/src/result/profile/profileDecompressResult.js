/**
 * benchmark/src/result/profile/profileDecompressResult.js
 */

import { ProfileResult } from './profileResult.js';

export class ProfileDecompressResult extends ProfileResult {
    constructor(libraryName, inputSize, durationMs, tickLogPath, processedLogPath) {
        super(libraryName, 'decompress', inputSize, durationMs, tickLogPath, processedLogPath);
    }
}

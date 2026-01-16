/**
 * benchmark/src/bench/shared/benchRun.js
 * 
 * Executor class that orchestrates the benchmark execution based on BenchConfig.
 * Uses Out-of-Process (Spawn) runners for isolation and accuracy.
 */

import { BenchConfig } from './benchConfig.js';
import { BenchResults } from '../../result/benchResults.js';

// Import Spawn Runners (Out-of-Process)
import { BenchCompressFilesSpawn } from '../compress/benchCompressFilesSpawn.js';
import { BenchDecompressFilesSpawn } from '../decompress/benchDecompressFilesSpawn.js';
import { BenchRoundtripFilesSpawn } from '../roundtrip/benchRoundtripFilesSpawn.js';

export class BenchRun {
    /**
     * @param {BenchConfig} config 
     */
    constructor(config) {
        this.config = config;
        this.results = new BenchResults(config);
    }

    /**
     * Executes the benchmark.
     * @param {string} type - 'compress' | 'decompress' | 'roundtrip'
     * @returns {Promise<BenchResults>}
     */
    async execute(type) {
        // Use Headers/Names for Spawn Arguments
        const libNames = this.config.libs.getNames();
        // Use Absolute Paths for input arguments to ensure spawned process finds them
        const inputPaths = this.config.inputs.getFiles().map(f => f.path);

        const { samples, warmups } = this.config;

        let runner;

        switch (type) {
            case 'compress':
                runner = new BenchCompressFilesSpawn(libNames, inputPaths, samples, warmups);
                break;
            case 'decompress':
                runner = new BenchDecompressFilesSpawn(libNames, inputPaths, samples, warmups);
                break;
            case 'roundtrip':
                runner = new BenchRoundtripFilesSpawn(libNames, inputPaths, samples, warmups);
                break;
            default:
                throw new Error(`Unknown benchmark type: ${type}`);
        }

        // Run (Spawn is synchronous in implementation usually, but marked async here for API compatibility)
        const metrics = await Promise.resolve(runner.run());

        // Store
        this.results.setResults(metrics);

        return this.results;
    }
}

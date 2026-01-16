/**
 * benchmark/src/result/benchResults.js
 * 
 * Top-level container for all data related to a benchmark run.
 * Includes configuration, system info, timestamps, and the results themselves.
 */

import { BenchConfig } from '../bench/shared/benchConfig.js';
import { BenchSysInfo } from '../bench/shared/benchSysInfo.js';

export class BenchResults {
    /**
     * @param {BenchConfig} config 
     */
    constructor(config) {
        this.config = config;
        this.sysInfo = new BenchSysInfo().capture();
        this.startTime = new Date();
        this.endTime = null;
        this.results = {}; // The actual metrics map
    }

    /**
     * Sets the benchmark execution results.
     * @param {object} resultsMap 
     */
    setResults(resultsMap) {
        this.results = resultsMap;
        this.endTime = new Date(); // Mark end time when results are set (approx)
    }

    toJSON() {
        return {
            meta: {
                startTime: this.startTime,
                endTime: this.endTime,
                durationMs: this.endTime ? (this.endTime - this.startTime) : 0
            },
            system: this.sysInfo.toJSON(),
            config: this.config.toJSON(),
            // Results structure depends on the runner (Single/Multi file, Single/Multi lib)
            // But usually it's nested objects/arrays which are JSON serializable.
            // If the results modify their toJSON behavior (like ResultClass), they will define serialization.
            results: this.results
        };
    }
}

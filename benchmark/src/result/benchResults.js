/**
 * benchmark/src/result/benchResults.js
 * 
 * Top-level container for all data related to a benchmark listLibs.
 * Includes configuration, system info, timestamps, and the results themselves.
 */

import { BenchConfig } from '../bench/shared/benchConfig.js';
import { BenchSysInfo } from '../bench/shared/benchSysInfo.js';
import { ResultsAggClass } from './shared/resultsAggClass.js';
import { ResultsSummaryClass } from './shared/resultsSummaryClass.js';

import {ResultsClass} from "./shared/resultsClass.js";

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
        this.resultsAgg = null;
        this.summary = null;
    }

    /**
     * Sets the benchmark execution results.
     * @param {[ResultsClass]} resultsMap
     */
    setResults(resultsMap) {
        this.results = resultsMap;
        this.endTime = new Date(); // Mark end time when results are set (approx)

        // Calculate Aggregations & Summary
        this.resultsAgg = new ResultsAggClass(this);
        this.summary = new ResultsSummaryClass(this);
    }

    /**
     *
     * @returns {{meta: {startTime: Date, endTime: null, durationMs: (number|number)}, system: {timestamp: *, system: *}, config: {libs: *, inputs: *, samples: *, warmups: *, options: *}, summary: (*|null), resultsAgg: (*|null), results: (*|{})}}
     */
    toJSON() {
        return {
            meta: {
                startTime: this.startTime,
                endTime: this.endTime,
                durationMs: this.endTime ? (this.endTime - this.startTime) : 0
            },
            system: this.sysInfo.toJSON(),
            config: this.config.toJSON(),
            summary: this.summary ? this.summary.toJSON() : null,
            resultsAgg: this.resultsAgg ? this.resultsAgg.toJSON() : null,
            results: this.results
        };
    }
}


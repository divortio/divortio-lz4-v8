/**
 * benchmark/src/result/shared/resultsAggClass.js
 * 
 * Container for Aggregated Benchmark Results.
 */

import { Aggregator } from '../tabulate/aggResults.js';
import {BenchResults} from "../benchResults.js";

export class ResultsAggClass {
    /**
     * @param {BenchResults} benchResults
     */
    constructor(benchResults) {
        this.data = this.calculate(benchResults);
    }

    /**
     *
     * @param benchResults {BenchResults}
     */
    calculate(benchResults) {
        // Standard Aggregation: Group by Library, File
        // Metrics: Throughput (Avg, Med, Max), Ratio (Avg), Duration (Avg)

        const dimensions = [
            { name: 'library', as: 'Library' },
            { name: 'filename', as: 'File' }
        ];

        const metrics = [
            { name: 'throughput', agg: 'AVG', as: 'throughputAvg' },
            { name: 'throughput', agg: 'MED', as: 'throughputMed' },
            { name: 'throughput', agg: 'MAX', as: 'throughputMax' },
            { name: 'ratio', agg: 'AVG', as: 'ratioAvg' },
            { name: 'durationMs', agg: 'AVG', as: 'durationAvg' }
        ];

        const orderBy = [
            { name: 'throughput', agg: 'AVG', asc: false }
        ];

        return Aggregator.aggregate(benchResults, dimensions, metrics, orderBy);
    }

    toJSON() {
        return this.data;
    }
}

/**
 * benchmark/src/result/shared/resultsSummaryClass.js
 * 
 * Container for High-Level Benchmark Summary.
 */

import {BenchResults} from "../benchResults.js";
import { Aggregator } from '../tabulate/aggResults.js';

export class ResultsSummaryClass {
    /**
     * @param {BenchResults} benchResults
     */
    constructor(benchResults) {
        this.data = this.calculate(benchResults);
    }

    calculate(benchResults) {
        // High Level Summary: Group by Library only
        // Metrics: Total Throughput (Sum of Avgs? Or Avg of Avgs? Usually Avg per Lib), 
        // Total Duration (Sum), Total Files (Count)

        // Actually for summary, we often want per-library stats across all files.
        const dimensions = [
            { name: 'library', as: 'Library' }
        ];

        const metrics = [
            { name: 'throughput', agg: 'AVG', as: 'throughputAvg' },
            { name: 'durationMs', agg: 'SUM', as: 'totalDuration' },
            { name: 'filename', agg: 'COUNT', as: 'filesProcessed' }
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

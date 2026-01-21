/**
 * benchmark/src/report/markdown/mdTableResultsAgg.js
 * 
 * Generates a markdown table for Aggregated Results.
 */

import { Aggregator } from '../../result/tabulate/aggResults.js';
import { generateTable, formatValue } from './mdTableBase.js';
import { DimensionField, MetricField, SortFieldAsc, SortFieldDesc } from '../../result/tabulate/aggTypes.js';

/**
 * Generates markdown table for aggregated results.
 * @param {BenchResults} benchResults 
 * @param {object} [overrides] - Optional overrides for dimensions, metrics, order.
 * @returns {string}
 */
export function generateResultsAggTable(benchResults, overrides = {}) {
    // defaults: 
    // dimensions: ['corpusName' as Corpus, 'filename' as File]
    // metrics: [MED(throughput) as medThroughput, MED(durationMs) as medDuration]
    // orderBy: [MED(throughput) DESC]

    const dimensions = overrides.dimensions || [
        DimensionField('library', 'Library'), // Added Semantic Name
        DimensionField('corpusName', 'Corpus'),
        DimensionField('filename', 'File')
    ];

    const metrics = overrides.metrics || [
        MetricField('ratio', 'medRatio', 'MED'),
        MetricField('durationMs', 'medDuration', 'MED'),
        MetricField('throughput', 'medThroughput', 'MED')
    ];

    const orderBy = overrides.orderBy || [
        SortFieldDesc('throughput', 'MED')
    ];

    const rows = Aggregator.aggregate(benchResults, dimensions, metrics, orderBy);
    if (rows.length === 0) return '';

    // Auto-generate column definitions based on the FIRST row
    const firstRow = rows[0];
    const columns = Object.keys(firstRow).map(key => {
        let formatter = undefined;
        // Formatting heuristics
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('throughput')) {
            // MB/s, 1 decimal
            formatter = (v) => (typeof v === 'number') ? (v / (1024 * 1024)).toFixed(1) + ' MB/s' : '';
        } else if (lowerKey.includes('duration') || lowerKey.includes('time')) {
            // ms, 1 decimal, suffix ms
            formatter = (v) => v ? v.toFixed(1) + ' ms' : '';
        } else if (lowerKey.includes('ratio')) {
            // 2 decimals
            formatter = (v) => v ? v.toFixed(2) : '';
        }

        // Ensure specific column order? Object.keys order depends on insertion in aggResults.
        // aggResults inserts dimensions first, then metrics.
        // So: Corpus, File, medDuration, medThroughput.
        // But user requested: Corpus, File, medDuration, medThroughput. 
        // Metric insertion order depends on metric array order.
        // My metric array is [duration, throughput]. So medDuration comes first.
        // Matches request.

        return {
            header: key, // key is already the Alias (Corpus, File, medDuration...)
            key: key,
            formatter: formatter
        };
    });

    return generateTable(rows, columns);
}

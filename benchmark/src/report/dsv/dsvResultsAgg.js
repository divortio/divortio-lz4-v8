import { Aggregator } from '../tabulate/aggResults.js';
import { generateDSV } from './dsvBase.js';
import { DimensionField, MetricField, SortFieldAsc, SortFieldDesc } from '../tabulate/aggTypes.js';

/**
 * Generates DSV content for aggregated results.
 * @param {BenchResults} benchResults 
 * @param {object} [overrides]
 * @param {object} [dsvOptions]
 * @returns {string}
 */
export function generateResultsAggDSV(benchResults, overrides = {}, dsvOptions = {}) {
    const dimensions = overrides.dimensions || [
        DimensionField('environment', 'env'),
        DimensionField('language'),
        DimensionField('package'),
        DimensionField('corpusName', 'corpus'),
        DimensionField('filename', 'file')
    ];

    const metrics = overrides.metrics || [
        MetricField('throughput', 'medThroughput', 'MED'),
        MetricField('durationMs', 'avgDurationMs', 'AVG')
    ];

    const orderBy = overrides.orderBy || [
        SortFieldAsc('corpusName'),
        SortFieldAsc('filename'),
        SortFieldDesc('throughput', 'MED')
    ];

    const rows = Aggregator.aggregate(benchResults, dimensions, metrics, orderBy);
    if (rows.length === 0) return '';

    // Auto-generate columns
    const firstRow = rows[0];
    const columns = Object.keys(firstRow).map(key => {
        let formatter = undefined;
        // DSV formatting (high precision usually desired)
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('throughput')) {
            formatter = (v) => v ? v.toFixed(3) : '';
        } else if (lowerKey.includes('duration') || lowerKey.includes('time')) {
            formatter = (v) => v ? v.toFixed(3) : '';
        } else if (lowerKey.includes('ratio')) {
            formatter = (v) => v ? v.toFixed(6) : '';
        }

        return {
            header: key,
            key: key,
            formatter: formatter
        };
    });

    return generateDSV(rows, columns, dsvOptions);
}

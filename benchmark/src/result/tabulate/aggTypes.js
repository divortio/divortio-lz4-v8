/**
 * benchmark/src/report/tabulate/aggTypes.js
 * 
 * Defines primitives for Aggregation: Dimensions, Metrics, and Sorting.
 */

// --- Validators ---

function validateString(val, name) {
    if (typeof val !== 'string' || val.trim() === '') {
        throw new Error(`Invalid ${name}: must be a non-empty string.`);
    }
    return val.trim();
}

function validateOptionalString(val, name) {
    if (!val) return undefined;
    if (typeof val !== 'string') return undefined; // or throw? strict validation asked.
    return val.trim();
}

// --- Types ---

/**
 * Creates a Dimension Field definition.
 * @param {string} name - The dimension name (e.g., 'environment').
 * @param {string} [as] - Optional alias.
 * @returns {{name: string, as: string|undefined, type: 'dimension'}}
 */
export function DimensionField(name, as) {
    const d = {
        name: validateString(name, 'Dimension Name'),
        as: validateOptionalString(as, 'Dimension Alias'),
        type: 'dimension'
    };
    return d;
}

/**
 * Creates a Metric Field definition.
 * @param {string} name - The metric name (e.g., 'throughput').
 * @param {string} [as] - Optional alias.
 * @param {string} agg - Aggregation function (e.g., 'MED', 'AVG').
 * @returns {{name: string, as: string|undefined, agg: string, type: 'metric'}}
 */
export function MetricField(name, as, agg) {
    const m = {
        name: validateString(name, 'Metric Name'),
        as: validateOptionalString(as, 'Metric Alias'),
        agg: validateString(agg, 'Aggregation Function').toUpperCase(),
        type: 'metric'
    };
    return m;
}

/**
 * Creates an Ascending Sort Field definition.
 * @param {string} name - The field name.
 * @param {string} [agg] - Optional aggregation function if sorting by a metric.
 * @returns {{name: string, agg: string|undefined, asc: boolean, type: 'sort'}}
 */
export function SortFieldAsc(name, agg) {
    return {
        name: validateString(name, 'Sort Field Name'),
        agg: validateOptionalString(agg, 'Sort Field Agg'), // Uppercase?
        asc: true,
        type: 'sort'
    };
}

/**
 * Creates a Descending Sort Field definition.
 * @param {string} name - The field name.
 * @param {string} [agg] - Optional aggregation function if sorting by a metric.
 * @returns {{name: string, agg: string|undefined, asc: boolean, type: 'sort'}}
 */
export function SortFieldDesc(name, agg) {
    return {
        name: validateString(name, 'Sort Field Name'),
        agg: validateOptionalString(agg, 'Sort Field Agg'),
        asc: false,
        type: 'sort'
    };
}

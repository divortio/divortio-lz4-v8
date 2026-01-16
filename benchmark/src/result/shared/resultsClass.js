import { ResultClass } from './resultClass.js';

/**
 * @class ResultsClass
 * @description Base collection class for managing multiple ResultClass instances.
 * Provides aggregation and statistical analysis.
 */
export class ResultsClass {
    /**
     * @param {ResultClass[]} [initialResults=[]] - Optional array of ResultClass objects.
     */
    constructor(initialResults = []) {
        /** @type {ResultClass[]} */
        this._samples = [];

        // Cached stats
        this._mean = undefined;
        this._median = undefined;
        this._stdDev = undefined;
        this._fastest = undefined;
        this._slowest = undefined;

        if (Array.isArray(initialResults)) {
            for (const result of initialResults) {
                this.addResult(result);
            }
        }
    }

    /**
     * Adds a result to the collection.
     * @param {ResultClass} result
     */
    addResult(result) {
        if (!(result instanceof ResultClass)) {
            throw new Error('Invalid argument: Must be instance of ResultClass');
        }
        this._samples.push(result);
        this._invalidateCache();
    }

    /**
     * Clears cached statistical calculations.
     * @private
     */
    _invalidateCache() {
        this._mean = undefined;
        this._median = undefined;
        this._stdDev = undefined;
        this._fastest = undefined;
        this._slowest = undefined;
    }

    /**
     * Total number of samples.
     * @returns {number}
     */
    get count() {
        return this._samples.length;
    }

    /**
     * Returns all samples.
     * @returns {ResultClass[]}
     */
    get all() {
        return [...this._samples];
    }

    /**
     * The sample with highest throughput.
     * @returns {ResultClass|null}
     */
    get fastest() {
        if (this._fastest === undefined && this.count > 0) {
            this._fastest = this.getSorted('throughput', 'desc')[0];
        }
        return this._fastest || null;
    }

    /**
     * The sample with lowest throughput.
     * @returns {ResultClass|null}
     */
    get slowest() {
        if (this._slowest === undefined && this.count > 0) {
            this._slowest = this.getSorted('throughput', 'asc')[0];
        }
        return this._slowest || null;
    }

    /**
     * Arithmetic Mean (Average) throughput (bytes/s).
     * @returns {number}
     */
    get mean() {
        if (this._mean === undefined) {
            if (this.count === 0) {
                this._mean = 0;
            } else {
                const total = this._samples.reduce((sum, s) => sum + s.throughput, 0);
                this._mean = total / this.count;
            }
        }
        return this._mean;
    }

    /**
     * Median throughput (bytes/s).
     * @returns {number}
     */
    get median() {
        if (this._median === undefined) {
            if (this.count === 0) {
                this._median = 0;
            } else {
                const sorted = this.getSorted('throughput', 'desc');
                const mid = Math.floor(sorted.length / 2);
                if (sorted.length % 2 !== 0) {
                    this._median = sorted[mid].throughput;
                } else {
                    this._median = (sorted[mid - 1].throughput + sorted[mid].throughput) / 2;
                }
            }
        }
        return this._median;
    }

    /**
     * Standard Deviation of throughput.
     * @returns {number}
     */
    get stdDev() {
        if (this._stdDev === undefined) {
            if (this.count === 0) {
                this._stdDev = 0;
            } else {
                const mean = this.mean;
                const squareDiffs = this._samples.map(s => {
                    const diff = s.throughput - mean;
                    return diff * diff;
                });
                const avgSquareDiff = squareDiffs.reduce((sum, d) => sum + d, 0) / this.count;
                this._stdDev = Math.sqrt(avgSquareDiff);
            }
        }
        return this._stdDev;
    }

    /**
     * Gets specific percentile throughput (0-100).
     * @param {number} p
     * @returns {number}
     */
    getPercentile(p) {
        if (this.count === 0) return 0;
        const sorted = this.getSorted('throughput', 'asc');
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))].throughput;
    }

    /**
     * Sorts samples by field.
     * @param {string} field
     * @param {string} order 'asc' or 'desc'
     * @returns {ResultClass[]}
     */
    getSorted(field = 'throughput', order = 'desc') {
        return [...this._samples].sort((a, b) => {
            const valA = a[field];
            const valB = b[field];
            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Summary object.
     * @returns {object}
     */
    toJSON() {
        return {
            samples: this._samples.map(s => s.toJSON()),
            count: this.count,
            fastest: this.fastest ? this.fastest.throughputH : 'N/A',
            slowest: this.slowest ? this.slowest.throughputH : 'N/A',
            mean: ResultClass.formatBytes(this.mean) + '/s',
            median: ResultClass.formatBytes(this.median) + '/s',
            p95: ResultClass.formatBytes(this.getPercentile(95)) + '/s',
            stdDev: this.stdDev.toFixed(2)
        };
    };
};

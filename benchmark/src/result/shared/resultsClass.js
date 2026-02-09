import {ResultClass} from './resultClass.js';
import fs from "fs";
import {CompressionResult} from "../compression/compressionResult.js";

/**
 * @class ResultsClass
 * @description Base collection class for managing multiple ResultClass instances.
 * Provides aggregation and statistical analysis.
 */
export class ResultsClass {

    /** @type {string} */
    name;

    /** @type {string} */

    type;

    /** @type {ResultClass[]} */
    _samples = [];

    /**
     *
     * @type {Number}
     */
    _mean;
    /**
     *
     * @type {Number}
     */
    _median;
    /**
     *
     * @type {Number}
     */
    _stdDev;
    /**
     *
     * @type {ResultClass}
     */
    _fastest;

    /**
     *
     * @type {ResultClass}
     */
    _slowest;

    /**
     * @param type {string|null}
     * @param name {string|null}
     * @param results {ResultClass[]} - Optional array of ResultClass objects.
     */
    constructor(type = null, name = null, results = []) {
        if (name && name instanceof String && name.length > 0) {
            this.name = name;
        }
        if (type && type instanceof String && type.length > 0) {
            this.type = type;
        }
        if (Array.isArray(results)) {
            for (const result of results) {
                this.add(result);
            }
        }
    }

    /**
     * Adds a result to the collection.
     * @param {ResultClass} result
     */
    add(result) {
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
     * The sample with the highest throughput.
     * @returns {ResultClass}
     */
    get fastest() {
        if (this._fastest === undefined && this.count > 0) {
            this._fastest = this.getSorted('throughput', 'desc')[0];
        }
        return this._fastest
    }

    /**
     * The sample with the lowest throughput.
     * @returns {ResultClass}
     */
    get slowest() {
        if (this._slowest === undefined && this.count > 0) {
            this._slowest = this.getSorted('throughput', 'asc')[0];
        }
        return this._slowest;
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
     * @returns {{name: string, type: string, samples: {name: string, inputSize: number, inputSizeH: string, outputSize: number, outputSizeH: string, startTime: number, endTime: number, durationMs: number, throughput: string, throughputBytes: number, ratio: number, timestampStart: number, timestampEnd: number}[], count: number, fastest: (string | string), slowest: (string | string), mean: string, median: string, p95: string, stdDev: string}}
     */
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            samples: this._samples.map(s => s.toJSON()),
            count: this.count,
            fastest: this.fastest ? this.fastest.throughputH : 'N/A',
            slowest: this.slowest ? this.slowest.throughputH : 'N/A',
            mean: ResultClass.formatBytes(this.mean) + '/s',
            median: ResultClass.formatBytes(this.median) + '/s',
            p95: ResultClass.formatBytes(this.getPercentile(95)) + '/s',
            stdDev: this.stdDev.toFixed(2)
        }
    }

    /**
     * Creates a CompressionResults instance from JSON data (array of samples).
     * @param {{name: string, type: string, samples: ResultClass[]}} data
     * @returns {ResultsClass}
     */
    static fromJSON(data) {
        let samples = [];
        if (Array.isArray(data)) {
            samples = data;
        } else if (data && Array.isArray(data.samples)) {
            samples = data.samples;
        } else {
            throw new Error('Invalid JSON: expected array of samples or object with samples field');
        }
        const t = (data.type && data.type instanceof String && data.type.length > 0) ? data.type : null;
        const n = (data.name && data.name instanceof String && data.name.length > 0) ? data.name : null;
        const results = new ResultsClass(t, n);
        for (const s of samples) {
            results.add(new ResultClass(
                s.type,
                s.name,
                s.inputSize,
                s.outputSize,
                s.startTime,
                s.endTime,
                s.timestampStart,
                s.timestampEnd
            ));
        }
        return results;
    }

    /**
     * Creates a CompressionResults instance from a JSON file.
     * @param {string} filePath
     * @returns {ResultsClass}
     */
    static fromJSONFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const samples = JSON.parse(content);
        return ResultsClass.fromJSON(samples);
    }


}

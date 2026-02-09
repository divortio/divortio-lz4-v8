/**
 * benchmark/src/report/tabulate/aggResults.js
 * 
 * Provides SQL-like aggregation capabilities for Benchmark Results.
 * Supports Group By (dimensions), Metrics, Aggregations, and Sorting.
 */
import {BenchResults} from "../benchResults.js";
import { sortData } from '../../report/dsv/dsvBase.js'; // Reuse generic sort if needed, but we'll specific multi-sort here.

export class Aggregator {
    /**
     * Aggregates benchmark results.
     * 
     * @param {BenchResults} benchResults - The BenchResults object.
     * @param {Array<import('./aggTypes.js').DimensionField>} dimensions
     * @param {Array<import('./aggTypes.js').MetricField>} metrics
     * @param {Array<import('./aggTypes.js').SortFieldAsc|import('./aggTypes').SortFieldDesc>} orderBy
     * @returns {object[]} - Array of aggregated row objects.
     */
    static aggregate(benchResults, dimensions = [], metrics = [], orderBy = []) {
        if (!benchResults) return [];

        // 1. Flatten all samples and enrich with metadata (env, lang, package)
        const allSamples = Aggregator.flattenSamples(benchResults);

        // 2. Group samples by dimensions
        const groups = new Map();
        for (const sample of allSamples) {
            // Key is composite of dimension *names* (not aliases)
            const keyParts = dimensions.map(d => sample[d.name]);
            const key = keyParts.join('::');

            if (!groups.has(key)) {
                groups.set(key, { samples: [], keyParts: {} });
            }
            const group = groups.get(key);
            group.samples.push(sample);

            // Store dimension values using ALIAS or NAME
            dimensions.forEach((d, i) => {
                const fieldName = d.as || d.name;
                group.keyParts[fieldName] = keyParts[i];
            });
        }

        // 3. Compute Aggregations
        const rows = [];
        for (const [key, group] of groups) {
            const row = { ...group.keyParts }; // Start with dimensions

            for (const m of metrics) {
                const funcName = Aggregator.normalizeAgg(m.agg);
                const result = Aggregator.compute(group.samples, m.name, funcName);

                // Output Name: Alias > Auto-generated
                const fieldName = m.as || Aggregator.getFieldName(m.name, funcName);
                row[fieldName] = result;
            }
            rows.push(row);
        }

        // 4. Sort
        if (orderBy && orderBy.length > 0) {
            rows.sort((a, b) => {
                for (const sortF of orderBy) {
                    // Determine which field name to check in the row
                    // The SortField name refers to the *source* name (e.g. 'throughput') or alias?
                    // User said: "The name property within a SortField* object is the name of the field being aggregating, this can be a dimension or a metric aggregation. The combination of name + agg creates a signature which we can map to the respective MetricField..."

                    let rowKey = sortF.name;

                    // If it has an agg, we must find the matching MetricField to know the alias used in 'row'
                    if (sortF.agg) {
                        const aggNorm = Aggregator.normalizeAgg(sortF.agg);
                        const matchedMetric = metrics.find(m => m.name === sortF.name && Aggregator.normalizeAgg(m.agg) === aggNorm);
                        // If we found a metric definition, use its alias or generated name
                        if (matchedMetric) {
                            rowKey = matchedMetric.as || Aggregator.getFieldName(matchedMetric.name, aggNorm);
                        } else {
                            // If not in metrics listCorpora but requested in sort, we might not have it in row?
                            // Generically try generated name
                            rowKey = Aggregator.getFieldName(sortF.name, aggNorm);
                        }
                    } else {
                        // Dimension? Find alias
                        const matchedDim = dimensions.find(d => d.name === sortF.name);
                        if (matchedDim) {
                            rowKey = matchedDim.as || matchedDim.name;
                        }
                    }

                    const valA = a[rowKey];
                    const valB = b[rowKey];

                    if (valA < valB) return sortF.asc ? -1 : 1;
                    if (valA > valB) return sortF.asc ? 1 : -1;
                }
                return 0;
            });
        }

        return rows;
    }

    /**
     * Extracts all samples from BenchResults into a flat array.
     * Enriches with metadata from BenchConfig.
     * @param benchResults {BenchResults}
     * @return {any[]}
     */
    static flattenSamples(benchResults) {
        const samples = [];
        if (!benchResults || !benchResults.results) return samples;

        // Create Metadata Lookup: Semantic Name -> { package, environment, language }
        const libMeta = {};
        if (benchResults.config && benchResults.config.libs) {
            // We need to access the internal listCorpora. BenchConfigLibs exposes getLibraries()
            // We assume benchResults restored/has config object with methods?
            // If from JSON, it might be plain object.
            // If pure object, benchResults.config.libs is array of strings. We lose metadata.
            // But let's assume valid runtime structure for now as per `generate_real_report.js`.
            const libsConfig = benchResults.config.libs;
            let libsArray = [];
            if (typeof libsConfig.getLibraries === 'function') {
                libsArray = libsConfig.getLibraries();
            } else if (Array.isArray(libsConfig)) {
                // If pure JSON, we might not have valid structure.
                // But let's assume valid runtime structure for now as per `generate_real_report.js`.
            }

            for (const l of libsArray) {
                // l is { name, library: BenchLib }
                if (l.library) {
                    libMeta[l.name] = {
                        package: l.library.package || 'Unknown',
                        environment: l.library.environment || 'Unknown',
                        language: l.library.language || 'Unknown'
                    };
                }
            }
        }

        // Create Input Metadata Lookup: Filename -> { corpusName }
        const inputMeta = {};
        if (benchResults.config && benchResults.config.inputs) {
            const inputsConfig = benchResults.config.inputs;
            let inputsArray = [];
            if (typeof inputsConfig.getFiles === 'function') {
                inputsArray = inputsConfig.getFiles();
            } else if (Array.isArray(inputsConfig)) {
                // If pure JSON...
            }

            for (const f of inputsArray) {
                // InputFile/CorpusFile usually has .filename and .corpusName
                if (f.filename) {
                    inputMeta[f.filename] = {
                        corpusName: f.corpusName || 'FILE'
                    };
                }
            }
        }

        const resultsMap = benchResults.results;
        const keys = Object.keys(resultsMap);
        if (keys.length === 0) return samples;
        const firstVal = resultsMap[keys[0]];
        const isSingleFile = firstVal && (firstVal.stats || firstVal.average || firstVal.results !== undefined || firstVal.samples);

        const addContext = (resObj, libName, fileNameOverride) => {
            const rawSamples = resObj.samples || (resObj.all ? resObj.all : []);
            const meta = libMeta[libName] || { package: 'Unknown', environment: 'Unknown', language: 'Unknown' };
            const filename = fileNameOverride || resObj.name || resObj.filename || 'Unknown';
            const iMeta = inputMeta[filename] || { corpusName: 'Unknown' };

            for (const s of rawSamples) {
                samples.push({
                    // Metrics (Use Getters from ResultClass usually)
                    throughput: s.throughput,
                    durationMs: s.durationMs || s.averageTime || (s.end - s.start), // Fallback
                    // Space Saving Ratio: (Input - Output) / Input
                    ratio: (s.inputSize > 0) ? (s.inputSize - s.outputSize) / s.inputSize : 0,
                    inputSize: s.inputSize,
                    outputSize: s.outputSize,
                    timestampStart: s.timestampStart,
                    timestampEnd: s.timestampEnd,

                    // Dimensions
                    library: libName,
                    filename: filename,

                    // Enriched Metadata
                    package: meta.package,
                    environment: meta.environment,
                    language: meta.language,
                    corpusName: iMeta.corpusName
                });
            }
        };

        if (isSingleFile || (firstVal.constructor && firstVal.constructor.name.includes('Results'))) {
            for (const [libName, resObj] of Object.entries(resultsMap)) {
                addContext(resObj, libName);
            }
        } else {
            for (const [fileName, libMap] of Object.entries(resultsMap)) {
                for (const [libName, resObj] of Object.entries(libMap)) {
                    addContext(resObj, libName, fileName);
                }
            }
        }

        return samples;
    }

    static normalizeAgg(agg) {
        if (!agg) return 'AVG';
        const u = agg.toUpperCase();
        if (['MED', 'MEDIAN'].includes(u)) return 'MED';
        if (['AVG', 'MEAN', 'AVERAGE'].includes(u)) return 'AVG';
        if (['MAX', 'MAXIMUM', 'FIRST'].includes(u)) return 'MAX';
        if (['MIN', 'MINIMUM', 'LAST'].includes(u)) return 'MIN';
        if (['SUM', 'TOTAL'].includes(u)) return 'SUM';
        if (['COUNT', 'N'].includes(u)) return 'COUNT';
        return 'AVG';
    }

    static getFieldName(metric, agg) {
        const prefix = agg.toLowerCase();
        const suffix = metric.charAt(0).toUpperCase() + metric.slice(1);
        return `${prefix}${suffix}`;
    }

    static compute(samples, metric, agg) {
        const values = samples.map(s => s[metric]).filter(v => typeof v === 'number');
        if (values.length === 0) return 0;

        switch (agg) {
            case 'MED':
                values.sort((a, b) => a - b);
                const mid = Math.floor(values.length / 2);
                return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
            case 'AVG':
                return values.reduce((a, b) => a + b, 0) / values.length;
            case 'MAX':
                return Math.max(...values);
            case 'MIN':
                return Math.min(...values);
            case 'SUM':
                return values.reduce((a, b) => a + b, 0);
            case 'COUNT':
                return values.length;
            default:
                return 0;
        }
    }
}

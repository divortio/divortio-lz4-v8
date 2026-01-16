/**
 * benchmark/src/report/mermaid/mermaidXYResults.js
 * 
 * Helper functions/classes to generate Mermaid Charts from BenchResults.
 */

import { MermaidXY } from './mermaidXY.js';

export class MermaidXYResults {
    /**
     * Generates a Bar Chart comparing libraries for a specific metric.
     * 
     * @param {BenchResults} benchResults 
     * @param {string} metric - 'throughput', 'averageTime', 'ratio', 'inputSize', 'outputSize'
     * @param {string} [filename] - Specific file to chart. If null, might try to average? (For now require specific or take first)
     * @returns {string} mermaid code
     */
    static generateMetricChart(benchResults, metric, filename = null) {
        if (!benchResults || !benchResults.results) return '';

        // Extract Data
        // Structure map: { filename: { libname: result } } or { libname: result } if single file
        // We need to normalize to { libName: value }

        let dataMap = {};
        const results = benchResults.results;

        // Detect Structure
        const keys = Object.keys(results);
        if (keys.length === 0) return '';
        const firstVal = results[keys[0]];
        const isSingleFile = firstVal && (firstVal.stats || firstVal.average || firstVal.results !== undefined);

        if (isSingleFile) {
            // It's { Lib: Result }
            // Ignore filename arg or warn if mismatch?
            dataMap = results;
        } else {
            // It's { File: { Lib: Result } }
            // If filename provided, pick it. Else pick first.
            const targetFile = filename || keys[0];
            if (!results[targetFile]) return `Error: File ${targetFile} not found in results.`;
            dataMap = results[targetFile];
        }

        // Build Series
        const libraries = Object.keys(dataMap);
        const values = libraries.map(lib => {
            const res = dataMap[lib];
            // Access metric
            // Assuming res object has these properties directly or getters
            // Note: In `dsvResults` we did careful extraction.
            if (metric === 'throughput') return res.throughput || 0;
            if (metric === 'averageTime') return res.averageTime || (res.average ? res.average.duration : 0);
            if (metric === 'ratio') {
                return (res.inputSize && res.outputSize) ? (res.inputSize / res.outputSize) : 0;
            }
            return res[metric] || 0;
        });

        // Determine Ranges (simple 0 to max * 1.1)
        const maxVal = Math.max(...values);
        const yRange = [0, Math.ceil(maxVal * 1.1) || 10]; // fallback 10 if all 0

        const chart = new MermaidXY()
            .setTitle(`${metric} Comparison${filename ? ` - ${filename}` : ''}`)
            .setXAxis({ title: 'Library', categories: libraries })
            .setYAxis({ title: metric, range: yRange })
            .addBar(values);

        return chart.generate();
    }
}

/**
 * benchmark/src/profile/src/profileTickProcMeta.js
 * 
 * Logic for extracting meta-insights from a Processed Tick Profile (JSON).
 */

export class ProfileTickProcMeta {
    /**
     * @param {object} profileJson - The JSON output from `node --prof-process --preprocess`
     */
    constructor(profileJson) {
        this.raw = profileJson;
        this.insights = {
            summary: {},
            hotFunctions: [],
            optimizationStatus: {}, // Optimized vs Unoptimized
            garbageCollection: { ticks: 0, percentage: 0 },
            executionBreakdown: {
                javascript: 0,
                cpp: 0,
                gc: 0
            },
            hotJsFunctions: [],
            hotCppFunctions: []
        };
    }

    analyze() {
        if (!this.raw) return this.insights;

        // Note: The V8 --preprocess JSON format from `node --prof-process` uses a specific structure:
        // raw.ticks: [ { tm, vm, s: [stack_index_1, stack_index_2...] } ]
        // raw.code: [ { name, type, ... } ]
        // The values in `s` (stack) are INDICES into the `raw.code` array.

        const ticks = this.raw.ticks || [];
        const breakdown = { javascript: 0, cpp: 0, gc: 0, other: 0 };
        const jsCounts = new Map();
        const cppCounts = new Map();

        const cwd = process.cwd();

        ticks.forEach(tick => {
            const stack = tick.s;
            if (stack && stack.length > 0) {
                // Stack contains INDICES into raw.code
                const topIndex = stack[0];

                // Validate index
                if (topIndex >= 0 && this.raw.code && topIndex < this.raw.code.length) {
                    const info = this.raw.code[topIndex];

                    if (info) {
                        const type = info.type || 'UNKNOWN';
                        let name = info.name || info.kind || 'unknown';

                        // Clean file paths (Privacy/Readability)
                        // Convert file:///Users/absolute/path/to/repo/src/... -> file:///src/...
                        if (name.includes(cwd)) {
                            name = name.split(cwd).join('');
                        }

                        if (type === 'JS') {
                            breakdown.javascript++;

                            // Parse Optimization Status
                            // * prefix = Optimized
                            // ~ prefix = Unoptimized
                            // (none) = Interpreted
                            let status = 'Interpreted';

                            if (name.startsWith('*')) {
                                status = 'Optimized (*)';
                                name = name.substring(1).trim();
                            } else if (name.startsWith('~')) {
                                status = 'Unoptimized (~)';
                                name = name.substring(1).trim();
                            }

                            // Use name as key, store object with count and status
                            const entry = jsCounts.get(name) || { count: 0, status, name };
                            entry.count++;
                            jsCounts.set(name, entry);

                        } else if (type === 'CPP') {
                            breakdown.cpp++;
                            const entry = cppCounts.get(name) || { count: 0, status: 'C++', name };
                            entry.count++;
                            cppCounts.set(name, entry);
                        } else if (type === 'GC') {
                            breakdown.gc++;
                        } else {
                            breakdown.other++;
                        }
                    } else {
                        breakdown.other++;
                    }
                } else {
                    breakdown.other++;
                }
            }
        });

        this.insights.executionBreakdown = breakdown;

        // Sort hot functions
        // Map values are now objects { count, status, name }
        const sortAndMap = (map) => [...map.values()]
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map(entry => ({
                name: entry.name,
                count: entry.count,
                status: entry.status,
                percentage: (entry.count / ticks.length * 100).toFixed(1) + '%'
            }));

        this.insights.hotJsFunctions = sortAndMap(jsCounts);
        this.insights.hotCppFunctions = sortAndMap(cppCounts);

        // Merge top overall for compat
        const combined = [...this.insights.hotJsFunctions, ...this.insights.hotCppFunctions]
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        this.insights.hotFunctions = combined;
        this.insights.summary.ticks = ticks.length;

        return this.insights;
    }
}

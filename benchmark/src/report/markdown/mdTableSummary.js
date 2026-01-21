/**
 * benchmark/src/report/markdown/mdTableSummary.js
 * 
 * Generates a high-level summary table grouped by Library.
 * Shows fastest/slowest files and overall performance.
 */

import { Aggregator } from '../../result/tabulate/aggResults.js';
import { generateTable, formatBytes } from './mdTableBase.js';

export function generateSummaryTable(benchResults) {
    if (!benchResults) return '';

    // 1. Get Flat Samples
    const samples = Aggregator.flattenSamples(benchResults);
    if (samples.length === 0) return '';

    // 2. Group by Library
    const groups = {};
    for (const s of samples) {
        const lib = s.library || 'Unknown';
        if (!groups[lib]) {
            groups[lib] = {
                library: lib,
                samples: [],
                totalInput: 0,
                totalThroughput: 0,
                count: 0
            };
        }
        groups[lib].samples.push(s);
        groups[lib].totalInput += s.inputSize || 0;
        // Check valid throughput
        if (typeof s.throughput === 'number') {
            groups[lib].totalThroughput += s.throughput;
            groups[lib].count++;
        }
    }

    // 3. Compute Stats per Library
    const rows = Object.values(groups).map(g => {
        // Sort by throughput to find fast/slow
        const sorted = g.samples.filter(s => typeof s.throughput === 'number')
            .sort((a, b) => b.throughput - a.throughput); // Descending

        const fastest = sorted.length > 0 ? sorted[0] : null;
        const slowest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
        const avgThroughput = g.count > 0 ? g.totalThroughput / g.count : 0;

        return {
            library: g.library,
            ops: g.count,
            totalInput: g.totalInput,
            avgThroughput: avgThroughput,
            fastest: fastest,
            slowest: slowest
        };
    });

    // 4. Create Columns
    const formatSpeed = (v) => (v / (1024 * 1024)).toFixed(1) + ' MB/s';

    const columns = [
        { header: 'Library', key: 'library' },
        { header: 'Files', key: 'ops', formatter: (v) => v ? Math.ceil(v / 5) : '0' }, // Assuming 5 samples per file? Samples count is raw samples. User might prefer "Files". 
        // Actually g.samples is ALL samples. If 5 samples per file, ops = 5 * files.
        // I should probably count unique files?
        // Let's just show "Samples" or "Ops".
        // Actually, user wants "Summary of results".
        // Maybe "Total Size" is better.
        { header: 'Total Size', key: 'totalInput', formatter: (v) => formatBytes(v) },
        { header: 'Avg Throughput', key: 'avgThroughput', formatter: (v) => formatSpeed(v) },
        {
            header: 'Fastest File',
            key: 'fastest',
            formatter: (s) => s ? `${s.filename} (${formatSpeed(s.throughput)})` : '-'
        },
        {
            header: 'Slowest File',
            key: 'slowest',
            formatter: (s) => s ? `${s.filename} (${formatSpeed(s.throughput)})` : '-'
        }
    ];

    // Modify "Files" column logic
    // Count unique files?
    rows.forEach(r => {
        const uniqueFiles = new Set(groups[r.library].samples.map(s => s.filename));
        r.fileCount = uniqueFiles.size;
    });
    // Replace Ops column with File Count
    columns[1] = { header: 'Files', key: 'fileCount' };

    return generateTable(rows, columns);
}

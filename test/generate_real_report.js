
import path from 'path';
import { BenchConfig } from '../benchmark/src/bench/shared/benchConfig.js';
import { BenchConfigLibs } from '../benchmark/src/bench/shared/benchConfigLibs.js';
import { BenchConfigInputs } from '../benchmark/src/bench/shared/benchConfigInputs.js';
import { BenchRun } from '../benchmark/src/bench/shared/benchRun.js';
import { MarkdownReport } from '../benchmark/src/report/markdown/mdReport.js';

async function run() {
    console.log('--- Generating Real Benchmark Report (Test Mode) ---');

    console.log(`Input: silesia (Corpus)`);

    const libs = new BenchConfigLibs(['v8.js.lz4Divortio', 'v8.js.fflate']);
    // Pass silesia in the second argument (corpora)
    const inputs = new BenchConfigInputs([], ['silesia']);
    const config = new BenchConfig(libs, inputs, 5, 2);

    const runner = new BenchRun(config);
    console.log('Running benchmark (Compress)...');

    try {
        const metrics = await runner.execute('compress');
        console.log('Benchmark complete.');

        const reporter = new MarkdownReport(metrics);
        reporter.loadTemplates();

        // Save to benchmark/results/real_report.md (relative from project root, but we run from test/?)
        // Save to real_report.md (will be in benchmark/results/real_report.md)
        const filePath = reporter.save('real_report.md');
        console.log(`Report saved to: ${filePath}`);
    } catch (err) {
        console.error('Benchmark failed:', err);
        console.error(err.stack);
    }
}

run().catch(console.error);

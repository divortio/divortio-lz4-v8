/**
 * dev/profiling/silesia.dickens/bench.compress.lz4-divortio_silesia.dickens.js
 * 
 * Executes the Benchmark CLI for the profiling workload.
 * Used by the orchestrator or standalone for verifying metrics.
 */

import { spawnSync } from 'child_process';
import path from 'path';

// Configuration
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');

// Configuration
const CONFIG = {
    library: 'lz4-divortio',
    input: path.join(PROJECT_ROOT, '.cacheCorpus/corpus/silesia/dickens'),
    script: path.join(PROJECT_ROOT, 'benchmark/src/bench/compress/benchCompressCLI.js')
};

function run(outputFile, samples = 10, warmups = 5) {
    const args = [
        CONFIG.script,
        '-l', CONFIG.library,
        '-i', CONFIG.input,
        '-s', samples,
        '-w', warmups,
        '-o', outputFile
    ];

    console.log(`[Bench] Running: node ${args.join(' ')}`);

    const child = spawnSync('node', args, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
        encoding: 'utf-8'
    });

    if (child.error) {
        console.error("Benchmark Failed:", child.error);
        process.exit(1);
    }
    if (child.status !== 0) {
        console.error(`Benchmark exited with code ${child.status}`);
        process.exit(child.status);
    }
}

// Allow standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const outputFile = process.argv[2] || 'bench_results.json';
    run(outputFile);
}

export { run };

/**
 * dev/profiling/silesia.dickens/bench.compress.v8JS_silesia.dickens.js
 * 
 * Comparative Benchmark: Pure JS/Browser Compatible Libraries.
 * Target: lz4-divortio vs lz4js vs lz4-browser etc.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');


// Configuration
const CONFIG = {
    // Select all "Browser" compatible libraries (mapped to V8 in catalog)
    env: 'browser',
    input: path.join(PROJECT_ROOT, '.cacheCorpus/corpus/silesia/dickens'),
    script: path.join(PROJECT_ROOT, 'benchmark/src/bench/compress/benchCompressCLI.js')
};

function run(outputFile, samples = 10, warmups = 5) {
    const args = [
        CONFIG.script,
        '--env', CONFIG.env,
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
    const defaultOutput = 'bench_v8JS_silesia.dickens.json';
    const outputFile = process.argv[2] || defaultOutput;
    run(outputFile);
}

export { run };

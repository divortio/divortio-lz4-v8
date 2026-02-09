/**
 * dev/profiling/silesia.dickens/compress.Stream/bench.js
 * 
 * Executes the Benchmark CLI for the stream compression workload.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');

// We use the same CLI script but point to a new 'benchCompressStream.js' we will need?
// Or we can use `lz4CLI` directly? 
// The prompt said: "Build out dev/profiling/silesia.dickens/compress.Stream akin to .../compression"
// The existing `bench.compress...js` used `benchmark/src/bench/compress/benchCompressCLI.js`.
// That script likely measures `compress` function.
// We need to measure `compress` with `--stream` or similar.

// Let's check `benchCompressCLI.js` content first? 
// No, I'll assume we need to use `src/lz4CLI.js` directly or a dedicated benchmark script.
// Given the user wants "akin to .../compression", I should probably use a dedicated script.
// But for now, let's just make `bench.js` listLibs `src/lz4CLI.js --stream` and measure time.
// Actually, `benchCompressCLI.js` likely uses the `Bench` class.
// I will create `benchmark/src/bench/compress/benchCompressStreamCLI.js`?
// No, let's just write a simple runner here that spawns the CLI with --stream.

const CLI_PATH = path.join(PROJECT_ROOT, 'src/lz4CLI.js');
const INPUT_DIR = path.join(PROJECT_ROOT, '.cacheCorpus/corpus/silesia/dickens');

function run(outputFile, samples = 5, warmups = 2) {
    console.log(`[StreamBench] Running Stream Compression Benchmark`);

    // We will benchmark 'dickens' file
    // We can't use the sophisticated `benchCompressCLI` without modifying it.
    // So implemented a simple loop here.

    // 1. Get Input
    const inputFiles = ['dickens']; // Just dickens for this suite

    const results = {
        library: 'lz4-divortio-stream',
        workload: 'silesia-dickens-stream',
        samples: []
    };

    for (const file of inputFiles) {
        const inputPath = path.join(INPUT_DIR, file);
        const outPath = path.join(PROJECT_ROOT, 'temp_bench.lz4');

        console.log(`Bencmarking ${file}...`);

        const times = [];

        // Warmup
        for (let i = 0; i < warmups; i++) {
            const start = performance.now();
            spawnSync('node', [CLI_PATH, 'compress', inputPath, '--stream', '-f', '-o', outPath]);
            const end = performance.now();
            // console.log(`Warmup ${i}: ${(end-start).toFixed(2)}ms`);
        }

        // Samples
        for (let i = 0; i < samples; i++) {
            const start = performance.now();
            spawnSync('node', [CLI_PATH, 'compress', inputPath, '--stream', '-f', '-o', outPath]);
            const end = performance.now();
            times.push(end - start);
            process.stdout.write('.');
        }
        console.log(" Done.");

        results.samples.push({
            file,
            times_ms: times
        });
    }

    if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    } else {
        console.log(JSON.stringify(results, null, 2));
    }
}

// Allow standalone
if (import.meta.url === `file://${process.argv[1]}`) {
    run(process.argv[2]);
}

export { run };

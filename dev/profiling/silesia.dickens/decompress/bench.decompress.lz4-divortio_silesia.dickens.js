/**
 * dev/profiling/silesia.dickens/decompress/bench.decompress.lz4-divortio_silesia.dickens.js
 * 
 * Target: lz4-divortio
 * Input: silesia/dickens (will auto-append .lz4 by default behavior of CLI if input file is not .lz4, 
 *        but benchDecompressCLI usually expects .lz4 input.
 *        We should check if .cacheCorpus/corpus/silesia/dickens.lz4 exists).
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');

// Ensure correct input file (Dickens.lz4)
// benchmark/src/bench/decompress/benchDecompressCLI.js likely takes an LZ4 file.
// Or does it compress on the fly? Usually decompression benchmarks need pre-compressed input.
// Let's assume we need to point to the .lz4 file.
const INPUT_BASE = path.join(PROJECT_ROOT, '.cacheCorpus/corpus/silesia/dickens');

// Check if .lz4 exists, if not we might need to compress it first or point to likely name.
// Standard CLI behavior: input file
const CONFIG = {
    library: 'lz4-divortio',
    input: INPUT_BASE, // The benchmark tool handles finding/generating the compressed input usually?
    // Wait, typical benchmark suites specific to Decompression usually take a compressed file.
    // However, my `benchDecompressCLI.js` logic should be checked. 
    // Usually it accepts the Original file and compresses it in-memory first for setup, OR takes .lz4.
    // Let's look at `benchDecompressInProc.js`.
    // If we pass the raw file, the bench might fail.
    // But `bench.compress` took the raw file.
    // Let's stick to raw file path for now, assuming the harness handles preparation.
    script: path.join(PROJECT_ROOT, 'benchmark/src/bench/decompress/benchDecompressCLI.js')
};

function run(outputFile, samples = 10, warmups = 5) {
    const args = [
        CONFIG.script,
        '-l', CONFIG.library,
        '-i', CONFIG.input, // Passing raw dickens. The tool hopefully handles it.
        '-s', samples,
        '-w', warmups,
        '-o', outputFile
    ];

    console.log(`[Bench] Running: node ${args.join(' ')}`);

    const child = spawnSync('node', args, {
        cwd: PROJECT_ROOT, // Important for module resolution
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
    const defaultOutput = 'bench_decompress_lz4-divortio_silesia.dickens.json';
    const outputFile = process.argv[2] || defaultOutput;
    run(outputFile);
}

export { run };

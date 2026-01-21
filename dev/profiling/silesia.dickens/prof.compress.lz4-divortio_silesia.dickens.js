/**
 * dev/profiling/silesia.dickens/prof.compress.lz4-divortio_silesia.dickens.js
 *
 * Profiling script for LZ4-Divortio compression on silesia.dickens corpus.
 *
 * Config:
 * - Samples: 5
 * - Warmup: 1
 * - Corpus: silesia.dickens
 * - Output: /dev/profiling/silesia.dickens/results
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve path to bench.js relative to this script
const benchCLI = path.resolve(__dirname, '../../../benchmark/bench.js');
const outputDir = path.resolve(__dirname, 'results');

console.log('Starting Profile for silesia.dickens...');
console.log(`Log Directory: ${outputDir}`);

const args = [
    'profile', 'compress',
    '-l', 'v8.js.lz4Divortio',  // Adjust if library name differs in `bench.js libs`
    '-c', 'silesia.dickens',
    '-s', '5',
    '-w', '1',
    '--meta',
    '--metaMd',
    '--diagnostic-dir', outputDir
];

const result = spawnSync(process.execPath, [benchCLI, ...args], {
    stdio: 'inherit',
    encoding: 'utf8'
});

if (result.error) throw result.error;
if (result.status !== 0) {
    console.error('Profile failed with exit code:', result.status);
    process.exit(1);
}

console.log('Profile completed successfully.');

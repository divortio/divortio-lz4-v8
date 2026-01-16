#!/usr/bin/env node

/**
 * benchmark/examples/compress/ex_compress.lz4-divortio.silesia.js
 * 
 * Example: Running a compression benchmark using LZ4 (Divortio) against the Silesia corpus.
 * This script is location-agnostic.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to the main benchmark entry point
const BENCH_SCRIPT = path.resolve(__dirname, '../../bench.js');

const args = [
    BENCH_SCRIPT,
    'compress',
    '--corpus', 'silesia',
    '--library', 'lz4Divortio', // Targeting lz4-divortio
    '--samples', '5',
    '--warmup', '2'
];

console.log(`Running: node ${args.join(' ')}`);

const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    cwd: process.cwd() // Run from current directory to prove path robustness
});

child.on('close', (code) => {
    process.exit(code);
});

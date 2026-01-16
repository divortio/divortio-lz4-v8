/**
 * benchmark/tests/utils/testUtils.js
 * 
 * Utilities for testing the Benchmark CLI.
 */

import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BENCH_CLI = path.resolve(__dirname, '../../bench.js');

/**
 * Runs the benchmark CLI with the given arguments.
 * @param {string[]} args 
 * @returns {{stdout: string, stderr: string, exitCode: number}}
 */
export function runBench(args) {
    try {
        const stdout = execFileSync(process.execPath, [BENCH_CLI, ...args], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'] // Capture stdout/stderr
        });
        return { stdout, stderr: '', exitCode: 0 };
    } catch (e) {
        return {
            stdout: e.stdout ? e.stdout.toString() : '',
            stderr: e.stderr ? e.stderr.toString() : e.message,
            exitCode: e.status || 1
        };
    }
}

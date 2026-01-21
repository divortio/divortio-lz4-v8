/**
 * dev/profiling/silesia.dickens/benchProf.compress.lz4-divortio_silesia.dickens.js
 * 
 * Orchestrator for Benchmark + Profiling.
 * 1. Runs Benchmark (Metrics baseline)
 * 2. Runs Profile (Hotpath analysis)
 * 3. Organizes artifacts by Job ID (Timestamp).
 */

import fs from 'fs';
import path from 'path';
import { run as runBench } from './bench.compress.lz4-divortio_silesia.dickens.js';
import { spawnSync } from 'child_process';

const JOB_ID = Date.now().toString();
const BASE_DIR = path.join(process.cwd(), 'dev/profiling/silesia.dickens');
const RESULTS_DIR = path.join(BASE_DIR, 'results', JOB_ID);

// Ensure results dir exists
fs.mkdirSync(RESULTS_DIR, { recursive: true });

console.log(`[Orchestrator] Job ID: ${JOB_ID}`);
console.log(`[Orchestrator] Results Dir: ${RESULTS_DIR}`);

// 1. Run Benchmark
const benchOutput = path.join(RESULTS_DIR, `bench_${JOB_ID}.json`);
console.log('\n--- Step 1: Benchmark ---');
// Samples 10, Warmup 5 as requested
runBench(benchOutput, 10, 5);

// 2. Run Profile
// We invoke the profile script directly, or wrap it. 
// The profile script currently hardcodes output path to dev/profiling/silesia.dickens/results
// We might need to move artifacts after run, OR modify profile script to accept output dir.
// For now, let's run it and move artifacts.
const profScript = path.join(BASE_DIR, 'prof.compress.lz4-divortio_silesia.dickens.js');
console.log('\n--- Step 2: Profile ---');

const profArgs = [profScript];
const child = spawnSync('node', profArgs, {
    cwd: process.cwd(),
    stdio: 'inherit',
    encoding: 'utf-8'
});

if (child.status !== 0) {
    console.error("Profile Failed!");
    process.exit(1);
}

// Move Profile Artifacts to Job Dir
// Profile script dumps to dev/profiling/silesia.dickens/results/
// We want to move *new* files to RESULTS_DIR (which is a subdir of results)
// Actually, looking at previous steps, it dumps to .cache/profile/... then moves to results/
// Let's implement a move.

const defaultResultsDir = path.join(BASE_DIR, 'results');
// We need to be careful not to move the job dir itself if it's inside results
// List files in results, ignoring directories (like our job dir)
const files = fs.readdirSync(defaultResultsDir);
let movedCount = 0;

for (const f of files) {
    const src = path.join(defaultResultsDir, f);
    const dest = path.join(RESULTS_DIR, f);

    // Check if it's a file and looks like a profile artifact
    const stat = fs.statSync(src);
    if (stat.isFile() && (f.startsWith('profTick') || f.startsWith('bench'))) {
        // Don't move if it's the bench file we just wrote (though it's already in subdir)
        if (src !== benchOutput) {
            fs.renameSync(src, dest);
            movedCount++;
        }
    }
}

console.log(`\n[Orchestrator] Completed. Artifacts moved: ${movedCount}`);
console.log(`[Orchestrator] All results in: ${RESULTS_DIR}`);

/**
 * dev/profiling/silesia.dickens/decompress/prof.decompress.lz4-divortio_silesia.dickens.js
 * 
 * Runs the Profile Workload in isolation with V8 profiling enabled (--prof).
 * Used for "Prof in Isolation" step.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');

// Directory for V8 Logs
const LOG_DIR = path.join(PROJECT_ROOT, '.cacheCorpus/profile/lz4-divortio');

const CONFIG = {
    library: 'lz4-divortio',
    input: path.join(PROJECT_ROOT, '.cacheCorpus/corpus/silesia/dickens'),
    script: path.join(PROJECT_ROOT, 'benchmark/src/profile/workloads/profileDecompressWorkload.js')
};

function run(samples = 10, warmups = 5) {
    // Ensure Log Dir Exists
    const fs = await import('fs');
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const logFile = path.join(LOG_DIR, `profTick_lz4-divortio_${Date.now()}.v8.log`);

    const args = [
        '--prof',
        '--no-logfile-per-isolate',
        `--logfile=${logFile}`,
        `--diagnostic-dir=${LOG_DIR}`,
        CONFIG.script,
        '-l', CONFIG.library,
        '-i', CONFIG.input,
        '-s', samples,
        '-w', warmups
    ];

    console.log(`[Prof] Running: node ${args.join(' ')}`);

    const child = spawnSync('node', args, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
        encoding: 'utf-8'
    });

    if (child.error) {
        console.error("Profiler Failed:", child.error);
        process.exit(1);
    }
    if (child.status !== 0) {
        console.error(`Profiler exited with code ${child.status}`);
        process.exit(child.status);
    }

    console.log(`[Prof] Log generated: ${logFile}`);
    // Note: We don't process the log here (node --prof-process) to keep it strictly isolation of execution.
    // The user can listLibs process later if needed, or rely on benchProf for that.
}

// Allow standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
    run(); // Default samples/warmups
}

export { run };

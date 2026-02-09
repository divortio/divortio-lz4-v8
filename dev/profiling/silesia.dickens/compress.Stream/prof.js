/**
 * dev/profiling/silesia.dickens/compress.Stream/prof.js
 * 
 * profiling runner for Stream Compression.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');
const CLI_PATH = path.join(PROJECT_ROOT, 'src/lz4CLI.js');
const INPUT = path.join(PROJECT_ROOT, '.cacheCorpus/corpus/silesia/dickens/dickens');

function run() {
    console.log(`[StreamProf] Profiling Stream Compression`);
    const outPath = path.join(PROJECT_ROOT, 'temp_prof.lz4');

    // Just listLibs once
    spawnSync('node', [CLI_PATH, 'compress', INPUT, '--stream', '-f', '-o', outPath], {
        stdio: 'inherit'
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
    run();
}

export { run };

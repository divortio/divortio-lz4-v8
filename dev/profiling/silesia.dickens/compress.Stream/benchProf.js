/**
 * dev/profiling/silesia.dickens/compress.Stream/benchProf.js
 * 
 * Orchestrator
 */
import { run as runBench } from './bench.js';
import { run as runProf } from './prof.js';

async function main() {
    console.log("=== Running Benchmark ===");
    // Syntax error in bench.js await import if not async? 
    // bench.js uses dynamic import for fs.
    await runBench('stream_baseline.json', 5, 2);

    console.log("\n=== Running Profile ===");
    runProf();
}

main();

/**
 * benchmark/src/profile/workloads/profileCompressWorkload.js
 * 
 * Optimized workload for profiling compression.
 * Minimizes overhead (no measurement, minimal GC intervention).
 */

import { parseArgs, resolveInputs } from '../../bench/shared/benchCLI.js';
import { resolveLibrary } from '../../cli/cliLibs.js';
import { performance } from 'perf_hooks';

async function main() {
    try {
        const config = parseArgs();

        // Resolve Library (Single)
        if (config.libraryNames.length !== 1) {
            throw new Error("Profile workload requires exactly one library.");
        }
        // resolveLibrary returns wrapper, we need benchLib wrapper
        const libWrapper = resolveLibrary(config.libraryNames[0]);
        // Wrapper has .class? No, resolveLibrary returns the BenchLib instance directly from cliLibs.js logic?
        // Let's check cliLibs.js lines 65/78: `return found ? cat[found].class : null;`
        // Or `return catalog[foundKey].class`.
        // Inspecting libs keys: `lz4Divortio: new BenchLib(...)`.
        // So it returns the BenchLib instance.
        // BenchLib has .load(), .compress().
        const library = libWrapper;

        // Resolve Inputs
        const inputFiles = resolveInputs(config.inputNames, config.corpusNames);

        // Load Library
        if (typeof library.load === 'function') {
            await library.load();
        }

        // Pre-load all inputs to memory to avoid I/O during profile loop
        const loadedInputs = inputFiles.map(f => ({
            name: f.filename,
            data: f.load()
        }));

        console.error(`[ProfileWorkload] Starting Compression loop: ${library.name}`);
        console.error(`[ProfileWorkload] Inputs: ${loadedInputs.length}, Samples: ${config.samples}, Warmups: ${config.warmups}`);

        // Warmup
        if (config.warmups > 0) {
            for (let i = 0; i < config.warmups; i++) {
                for (const input of loadedInputs) {
                    library.compress(input.data);
                }
            }
        }

        // Profile Loop
        const start = performance.now();
        for (let i = 0; i < config.samples; i++) {
            for (const input of loadedInputs) {
                const res = library.compress(input.data);
            }
        }
        const duration = performance.now() - start;

        // Output result for ProfileTick runner to capture
        console.log(JSON.stringify({ profileDuration: duration }));

        console.error("[ProfileWorkload] Complete.");

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main();

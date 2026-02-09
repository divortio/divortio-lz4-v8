/**
 * benchmark/src/profile/workloads/profileRoundtripWorkload.js
 * 
 * Optimized workload for profiling roundtrip (compress -> decompress).
 */

import { parseArgs, resolveInputs } from '../../bench/shared/benchCLI.js';
import { resolveLibrary } from '../../cli/libs/cliLibs.js';

async function main() {
    try {
        const config = parseArgs();

        if (config.libraryNames.length !== 1) {
            throw new Error("Profile workload requires exactly one library.");
        }
        const library = resolveLibrary(config.libraryNames[0]);
        const inputFiles = resolveInputs(config.inputNames, config.corpusNames);

        if (typeof library.load === 'function') {
            await library.load();
        }

        const loadedInputs = inputFiles.map(f => ({
            name: f.filename,
            data: f.load()
        }));

        console.error(`[ProfileWorkload] Starting Roundtrip loop: ${library.name}`);
        console.error(`[ProfileWorkload] Inputs: ${loadedInputs.length}, Samples: ${config.samples}, Warmups: ${config.warmups}`);

        // Warmup
        if (config.warmups > 0) {
            for (let i = 0; i < config.warmups; i++) {
                for (const input of loadedInputs) {
                    const compressed = library.compress(input.data);
                    library.decompress(compressed, input.data.byteLength);
                }
            }
        }

        // Profile Loop
        for (let i = 0; i < config.samples; i++) {
            for (const input of loadedInputs) {
                const compressed = library.compress(input.data);
                const decompressed = library.decompress(compressed, input.data.byteLength);
            }
        }

        console.error("[ProfileWorkload] Complete.");

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main();

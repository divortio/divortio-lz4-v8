/**
 * benchmark/src/profile/workloads/profileDecompressWorkload.js
 * 
 * Optimized workload for profiling decompression.
 */

import { parseArgs, resolveInputs } from '../../bench/shared/benchCLI.js';
import { resolveLibrary } from '../../cli/libs/cliLibs.js';

async function main() {
    try {
        const config = await parseArgs();

        if (config.libraryNames.length !== 1) {
            throw new Error("Profile workload requires exactly one library.");
        }
        const library = resolveLibrary(config.libraryNames[0]);
        const inputFiles = resolveInputs(config.inputNames, config.corpusNames);

        if (typeof library.load === 'function') {
            await library.load();
        }

        // Pre-load and Pre-Compress
        // Decompression benchmark inputs need to be compressed first.
        // We do this BEFORE the profile loop to measure ONLY decompression.

        console.error("[ProfileWorkload] Pre-compressing inputs...");
        const validInputs = [];

        for (const f of inputFiles) {
            const original = f.load();
            try {
                const compressed = library.compress(original);
                validInputs.push({
                    name: f.filename,
                    compressed: compressed,
                    originalSize: original.byteLength
                });
            } catch (e) {
                console.warn(`[Warngin] Skipping ${f.filename} due to compression failure: ${e.message}`);
            }
        }

        console.error(`[ProfileWorkload] Starting Decompression loop: ${library.name}`);
        console.error(`[ProfileWorkload] Inputs: ${validInputs.length}, Samples: ${config.samples}, Warmups: ${config.warmups}`);

        // Warmup
        if (config.warmups > 0) {
            for (let i = 0; i < config.warmups; i++) {
                for (const input of validInputs) {
                    library.decompress(input.compressed, input.originalSize);
                }
            }
        }

        // Profile Loop
        for (let i = 0; i < config.samples; i++) {
            for (const input of validInputs) {
                const res = library.decompress(input.compressed, input.originalSize);
            }
        }

        console.error("[ProfileWorkload] Complete.");

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main();

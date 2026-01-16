/**
 * benchmark/src/bench/compress/benchCompressCLI.js
 * 
 * CLI Entrypoint for Single-File Multi-Library Compression Benchmarks.
 */

import { parseArgs, resolveLibraries, resolveInput } from '../shared/benchCLI.js';
import { BenchCompressInProc } from './benchCompressInProc.js';

async function main() {
    try {
        const config = parseArgs();
        if (config.isHelp) {
            console.log("Usage: node benchCompressCLI.js -l <lib> [-l <lib2> ...] -i <input> [-s 5] [-w 2]");
            process.exit(0);
        }

        const libraries = resolveLibraries(config.libraryNames);
        // Single input for this script (legacy name, but expanded to support multi-lib)
        // Note: CLI architecture has split 'single file' vs 'files' scripts.
        // We take the first input if multiple provided, or warn? 
        // Let's assume user provides one input as per doc.
        const inputName = config.inputNames[0];
        if (!inputName) throw new Error("Input file required (-i)");

        const inputFile = resolveInput(inputName);

        const bench = new BenchCompressInProc(libraries, inputFile, config.samples, config.warmups);
        const resultsMap = await bench.run();

        // Output: { "libName": [samples...] }
        const output = {};
        for (const [libName, results] of Object.entries(resultsMap)) {
            output[libName] = results.all.map(r => r.toJSON());
        }

        console.log(JSON.stringify(output));

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main();

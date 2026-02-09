/**
 * benchmark/src/bench/decompress/benchDecompressCLI.js
 * 
 * CLI Entrypoint for Single-File Multi-Library Decompression Benchmarks.
 */

import { parseArgs, resolveInputs } from '../shared/benchCLI.js';
import { resolveLibraries } from '../../cli/libs/cliLibs.js';
import { BenchDecompressInProc } from './benchDecompressInProc.js';

async function main() {
    try {
        const config = await parseArgs();
        if (config.isHelp) {
            console.log("Usage: node benchDecompressCLI.js -l <lib> [-l <lib2>] -i <input> [-s 5] [-w 2]");
            process.exit(0);
        }

        const libraries = resolveLibraries(config.libraryNames);
        const inputName = config.inputNames[0];
        if (!inputName) throw new Error("Input file required (-i)");

        const inputFiles = resolveInputs([inputName]);
        const inputFile = inputFiles[0];

        const bench = new BenchDecompressInProc(libraries, inputFile, config.samples, config.warmups);
        const resultsMap = await bench.run();

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

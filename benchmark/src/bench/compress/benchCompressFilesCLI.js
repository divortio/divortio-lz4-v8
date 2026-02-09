/**
 * benchmark/src/bench/compress/benchCompressFilesCLI.js
 * 
 * CLI Entrypoint for Multi-File Multi-Library Compression Benchmarks.
 */

import { parseArgs, resolveInputs } from '../shared/benchCLI.js';
import { resolveLibraries } from '../../cli/libs/cliLibs.js';
import { BenchCompressFilesInProc } from './benchCompressFilesInProc.js';

async function main() {
    try {
        const config = parseArgs();
        if (config.isHelp) {
            console.log("Usage: node benchCompressFilesCLI.js -l <lib> [-l <lib2> ...] -i <input> ... [-s 5] [-w 2]");
            process.exit(0);
        }

        const libraries = resolveLibraries(config.libraryNames);
        const inputFiles = resolveInputs(config.inputNames);

        const bench = new BenchCompressFilesInProc(libraries, inputFiles, config.samples, config.warmups);
        const resultsMap = await bench.run();

        // Output: { "filename": { "libName": [samples...] } }
        const output = {};
        for (const [fileKey, libMap] of Object.entries(resultsMap)) {
            output[fileKey] = {};
            for (const [libKey, results] of Object.entries(libMap)) {
                output[fileKey][libKey] = results.all.map(r => r.toJSON());
            }
        }

        console.log(JSON.stringify(output));

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main();

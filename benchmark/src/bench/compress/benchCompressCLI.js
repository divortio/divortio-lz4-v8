/**
 * benchmark/src/bench/compress/benchCompressCLI.js
 * 
 * CLI Entrypoint for Single-File Multi-Library Compression Benchmarks.
 */

import { parseArgs, resolveInputs } from '../shared/benchCLI.js';
import { resolveLibraries } from '../../cli/cliLibs.js';
import { BenchCompressInProc } from './benchCompressInProc.js';
import { BenchConfig } from '../shared/benchConfig.js';
import { BenchResults } from '../../result/benchResults.js';
import { JSONBenchResults } from '../../report/json/jsonBenchResults.js';

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

        const inputFiles = resolveInputs([inputName]);
        const inputFile = inputFiles[0];

        // Run Benchmark
        const bench = new BenchCompressInProc(libraries, inputFile, config.samples, config.warmups);
        const resultsMap = await bench.run();

        // Create BenchConfig for Results Metadata
        const benchConfig = new BenchConfig(
            config.libraryNames,
            [inputName],
            config.samples,
            config.warmups,
            { formats: config.formats }
        );

        // Wrap in BenchResults (Calculates Aggregations & Summary)
        const benchResults = new BenchResults(benchConfig);
        benchResults.setResults(resultsMap);

        // File Output (if requested)
        if (config.output) {
            JSONBenchResults.generate(benchResults, {
                filename: config.output,
                isAppend: config.append
            });
        }

        // Console Output (Standardized)
        console.log(JSON.stringify(benchResults.toJSON(), null, 2));

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

main();

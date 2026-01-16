/**
 * benchmark/src/cli/cliRoundtrip.js
 * 
 * Handler for the 'roundtrip' command.
 */

import path from 'path';
import { BenchConfig } from '../bench/shared/benchConfig.js';
import { BenchConfigLibs } from '../bench/shared/benchConfigLibs.js';
import { BenchConfigInputs } from '../bench/shared/benchConfigInputs.js';
import { BenchRun } from '../bench/shared/benchRun.js';
import * as cliMarkdown from './cliMarkdown.js';
import * as cliDSV from './cliDSV.js';
import * as cliJSON from './cliJSON.js';
import { resolveOutputConfig } from './cliOutput.js';
import { logResults } from './cliLog.js';
import { filterLibraries } from '../bench/shared/benchLibCatalog.js';

export async function run(args) {
    if (args.filterEnvironment || args.filterLanguage) {
        const matched = filterLibraries({
            env: args.filterEnvironment,
            lang: args.filterLanguage
        });
        if (matched.length > 0) {
            const existing = new Set(args.libraryNames);
            let addedCount = 0;
            for (const lib of matched) {
                if (!existing.has(lib)) {
                    args.libraryNames.push(lib);
                    existing.add(lib);
                    addedCount++;
                }
            }
            if (addedCount > 0) console.log(`Added ${addedCount} libraries from filters.`);
        }
    }

    if (args.libraryNames.length === 0) {
        console.error('Error: At least one library must be specified (-l) or matched via filters.');
        process.exit(1);
    }
    if (args.inputNames.length === 0 && args.corpusNames.length === 0) {
        console.error('Error: At least one input (-i) or corpus (-c) must be specified.');
        process.exit(1);
    }

    const libs = new BenchConfigLibs(args.libraryNames);
    const inputs = new BenchConfigInputs(args.inputNames, args.corpusNames);
    const config = new BenchConfig(libs, inputs, args.samples, args.warmups);

    const runner = new BenchRun(config);
    console.log(`Running Roundtrip Benchmark...`);

    try {
        const metrics = await runner.execute('roundtrip');
        console.log('Benchmark complete.');
        logResults(metrics, args);
        const outConfig = resolveOutputConfig(args);

        for (const fmt of outConfig.formats) {
            if (fmt === 'md') {
                const fullPath = path.join(outConfig.dir, `${outConfig.baseFilename}.md`);
                cliMarkdown.generateReport(metrics, { filename: fullPath });
            } else if (fmt === 'json') {
                const fullPath = path.join(outConfig.dir, `${outConfig.baseFilename}.json`);
                cliJSON.generateReport(metrics, {
                    filename: fullPath,
                    isAppend: outConfig.isAppend
                });
            } else if (fmt === 'csv' || fmt === 'tsv') {
                cliDSV.generateReport(metrics, {
                    format: fmt,
                    dir: outConfig.dir,
                    filename: outConfig.baseFilename,
                    isAppend: outConfig.isAppend,
                    noHeader: outConfig.noHeader
                });
            } else {
                console.warn(`Unknown format: ${fmt}`);
            }
        }

    } catch (err) {
        console.error('Benchmark Execution Failed:', err);
        process.exit(1);
    }
}

#!/usr/bin/env node

/**
 * benchmark/bench.js
 * 
 * Main Entry Point for the Benchmark CLI.
 */

import { parseArgs } from './src/cli/cliArgs.js';
import { showHelp } from './src/cli/cliHelp.js';

import * as compressHandler from './src/cli/cliCompress.js';
import * as decompressHandler from './src/cli/cliDecompress.js';
import * as cliList from './src/cli/cliList.js';
import * as cliListLibs from './src/cli/cliListLibs.js';
import * as cliProfile from './src/cli/cliProfile.js';

import * as roundtripHandler from './src/cli/cliRoundtrip.js';
import { BenchCorpus as corpusHandler } from './src/corpus/benchCorpus.js';

const config = parseArgs();

if (config.isHelp || !config.command) {
    showHelp(config.command);
    process.exit(0);
}

switch (config.command) {
    case 'compress':
        compressHandler.run(config);
        break;
    case 'decompress':
        decompressHandler.run(config);
        break;
    case 'roundtrip':
        roundtripHandler.run(config);
        break;
    case 'profile':
        // Expect subcommand in config.unknown[0] (since cliArgs treats it as unknown flag)
        const sub = config.unknown && config.unknown.length > 0 ? config.unknown[0] : null;
        if (!sub) {
            console.error("Profile requires a subcommand (compress, decompress, roundtrip)");
            process.exit(1);
        }
        if (!['compress', 'decompress', 'roundtrip'].includes(sub)) {
            console.error(`Unknown profile subcommand: ${sub}`);
            process.exit(1);
        }
        cliProfile.run(sub);
        break;
    case 'libs':
    case 'libraries':
        cliListLibs.run(config);
        break;
    case 'corpus':
    case 'corpora':
        // list or subcommand?
        // if user types 'bench corpus cache silesia'?
        // The args parsing currently puts positional args in... config?
        // simple `bench corpus` maps to `list`.
        // config.pos? No, `parseArgs` puts non-flag args where?
        // parseArgs logic at Step 2613:
        // libraryNames, inputNames, corpusNames.
        // It doesn't capture sub-sub-commands easily.
        // But `list` command was specific.
        // Let's assume `bench corpus` -> list all.
        corpusHandler.list(config);
        break;
    case 'list':
        cliList.run(config);
        break;
    case 'build':
    case 'buildCorpus':
        // Old logic ran `cliBuildCorpus`.
        // config might contain corpus name in --corpus?
        // Or positional?
        // "node benchmark/bench.js build silesia" -> parseArgs logic?
        // `parseArgs` doesn't handle positional args well yet (Step 2613).
        // It slices process.argv[2]. Loop starts.
        // If 'build' is argv[2], loop continues.
        // Next arg 'silesia' is not -l/-i/-c. It's ignored or errors?
        // Step 2613 parseArgs:
        // `switch (arg)` ... default is ignored if loop logic matches flags.
        // Wait, loop iterates. if mismatch?
        // It's ignored!
        // We need to fix `parseArgs` to capture positional args for subcommands.
        // BUT for now, users rely on `-c silesia`?
        // `bench.js build -c silesia` -> `config.corpusNames = ['silesia']`.
        // So I'll use that.
        const targets = config.corpusNames;
        if (targets.length === 0) {
            console.error("Please specify corpus to build with -c (e.g. -c silesia)");
            process.exit(1);
        }
        for (const name of targets) {
            corpusHandler.cache(name);
        }
        break;
    default:
        console.error(`Unknown command: ${config.command}`);
        showHelp();
        process.exit(1);
}

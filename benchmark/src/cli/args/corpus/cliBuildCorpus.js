/**
 * benchmark/src/cli/cliBuildCorpus.js
 * 
 * Handler for the 'buildCorpus' command.
 */

import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import { CorpusCatalog } from '../corpus/catalog/corpusCatalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function run(args) {
    // 1. Check if specific corpus requested
    if (args.name) {
        const name = args.name.toLowerCase();
        const corpus = CorpusCatalog[name];

        if (!corpus) {
            console.error(`Error: Unknown corpus '${name}'. Available: ${Object.keys(CorpusCatalog).join(', ')}`);
            process.exit(1);
        }

        console.log(`Building/Downloading Corpus: ${corpus.name}`);
        const buildScript = path.resolve(__dirname, '../build', corpus.buildFile);

        runScript(buildScript);

    } else {
        // 2. Default: Rebuild Index (indexCorpus.js)
        console.log("Rebuilding Corpus Index (User Files)...");
        const buildScript = path.resolve(__dirname, '../build/indexCorpus.js');
        runScript(buildScript);
    }
}

function runScript(scriptPath) {
    const child = fork(scriptPath);

    child.on('error', (err) => {
        console.error(`Failed to start build script: ${scriptPath}`, err);
        process.exit(1);
    });

    child.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Build script exited with code ${code}`);
            process.exit(code);
        } else {
            console.log("Build complete.");
        }
    });
}

/**
 * benchmark/bench/benchCLI.js
 * 
 * Shared utilities for CLI benchmarks.
 * Handles argument parsing and resolution of libraries and input files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Library imports removed (moved to cliLibs.js)

// Import Input Abstractions
import { InputFile } from '../../input/inputFile.js';
import { resolveCorpusString } from '../../cli/args/corpus/cliCorpus.js';

/**
 * Parses command line arguments.
 * Expected format: --library <lib> --input <file> [--samples <N>] [--warmup <N>]
 * Aliases: -l, -i, -s, -w
 * @returns {object} { libraryName, inputName, samples, warmups, isHelp }
 * @returns {Promise<object>} { libraryName, inputName, samples, warmups, isHelp }
 */
export async function parseArgs() {
    const args = process.argv.slice(2);
    const config = {
        libraryNames: [], // Array of library strings
        inputNames: [],
        corpusNames: [],
        formats: [],
        output: null,
        append: false,
        samples: 5,
        warmups: 2,
        env: null,
        isHelp: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '--library':
            case '-l':
                config.libraryNames.push(next);
                i++;
                break;
            case '--input':
            case '-i':
                config.inputNames.push(next);
                i++;
                break;
            case '--corpus':
            case '-c':
                config.corpusNames.push(next);
                i++;
                break;
            case '--samples':
            case '-s':
                config.samples = parseInt(next, 10);
                i++;
                break;
            case '--warmup':
            case '--warmups':
            case '-w':
                config.warmups = parseInt(next, 10);
                i++;
                break;
            case '--formats':
            case '-f':
                config.formats.push(next);
                i++;
                break;
            case '--output':
            case '-o':
                config.output = next;
                i++;
                break;
            case '--append':
            case '-a':
                config.append = true;
                break;
            case '--meta':
                config.meta = true;
                break;
            case '--metaMd':
                config.metaMd = true;
                break;
            case '--help':
                config.isHelp = true;
                break;
            case '--env':
            case '-e':
                config.env = next;
                i++;
                break;
        }
    }

    if (config.env) {
        // Dynamic Resolution
        const { filterLibraries } = await import('./benchLibCatalog.js');
        const libs = filterLibraries({ env: config.env });
        if (libs.length > 0) {
            config.libraryNames.push(...libs);
        } else {
            console.warn(`Warning: No libraries found for env '${config.env}'`);
        }
    }

    return config;
}

// Library Resolution moved to cli/cliLibs.js

/**
 * Resolves a listCorpora of input names to a flat array of InputFile/CorpusFile objects.
 * Uses cliCorpus handlers for corpus resolution.
 * @param {string[]} rawNames 
 * @returns {Array<InputFile>}
 */
export function resolveInputs(rawNames) {
    if (!rawNames || rawNames.length === 0) {
        throw new Error("No inputs specified (-i)");
    }

    const results = [];

    for (const name of rawNames) {
        // 1. Try Corpus Resolution (Corpus, CorpusFile, CorpusTar)
        const corpusInputs = resolveCorpusString(name);
        if (corpusInputs && corpusInputs.length > 0) {
            results.push(...corpusInputs);
            continue;
        }

        // 2. Try Local File
        try {
            // Check if file exists to avoid confused errors
            if (!fs.existsSync(name)) {
                // If it's not a file, and not a corpus, it's an error.
                throw new Error(`File not found: ${name}`);
            }
            results.push(new InputFile(name));
        } catch (e) {
            throw new Error(`Failed to resolve input '${name}': ${e.message}`);
        }
    }
    return results;
}


/**
 * benchmark/src/bench/compress/benchCompressSpawn.js
 * 
 * Executes compression benchmark for SINGLE FILE + MULTI LIB in spawned process.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { CompressionResults } from '../../result/compression/compressionResults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_Script = path.join(__dirname, 'benchCompressCLI.js');

export class BenchCompressSpawn {
    /**
     * @param {string|string[]} libraryNames
     * @param {string} inputName
     * @param {number} samples
     * @param {number} warmups
     */
    constructor(libraryNames, inputName, samples = 5, warmups = 2) {
        this.libraryNames = Array.isArray(libraryNames) ? libraryNames : [libraryNames];
        this.inputName = inputName;
        this.samples = samples;
        this.warmups = warmups;

        /** @type {Object.<string, CompressionResults>} */
        this.results = {}; // Map<LibName, Results>
    }

    run() {
        const args = [CLI_Script];

        for (const lib of this.libraryNames) {
            args.push('-l', lib);
        }

        args.push('-i', this.inputName);
        args.push('-s', this.samples.toString());
        args.push('-w', this.warmups.toString());

        const child = spawnSync('node', args, {
            encoding: 'utf-8',
            cwd: process.cwd()
        });

        if (child.error) throw child.error;
        if (child.status !== 0) {
            const err = child.stderr ? child.stderr.toString() : 'Unknown Error';
            throw new Error(`Benchmark process failed (Exit ${child.status}): ${err}`);
        }

        const stdout = child.stdout.toString().trim();
        const lines = stdout.split('\n');
        const jsonLine = lines[lines.length - 1];

        try {
            // Expected: { "libName": [samples...] }
            const rawMap = JSON.parse(jsonLine);
            for (const [key, samples] of Object.entries(rawMap)) {
                this.results[key] = CompressionResults.fromJSON(samples);
            }
        } catch (e) {
            throw new Error(`Failed to parse benchmark results: ${e.message}\nOutput: ${stdout}`);
        }

        return this.results;
    }
}

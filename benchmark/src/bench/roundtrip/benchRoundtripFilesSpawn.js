/**
 * benchmark/src/bench/roundtrip/benchRoundtripFilesSpawn.js
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoundtripResults } from '../../result/roundtrip/roundtripResults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_Script = path.join(__dirname, 'benchRoundtripFilesCLI.js');

export class BenchRoundtripFilesSpawn {
    constructor(libraryNames, inputNames, samples = 5, warmups = 2) {
        this.libraryNames = Array.isArray(libraryNames) ? libraryNames : [libraryNames];
        this.inputNames = inputNames;
        this.samples = samples;
        this.warmups = warmups;
        this.results = {};
    }

    run() {
        const args = [CLI_Script];
        for (const lib of this.libraryNames) args.push('-l', lib);
        for (const input of this.inputNames) args.push('-i', input);
        args.push('-s', this.samples.toString());
        args.push('-w', this.warmups.toString());

        const child = spawnSync('node', args, {
            encoding: 'utf-8',
            cwd: process.cwd(),
            maxBuffer: 1024 * 1024 * 50
        });

        if (child.error) throw child.error;
        if (child.status !== 0) {
            const err = child.stderr ? child.stderr.toString() : 'Unknown Error';
            throw new Error(`Benchmark process failed (Exit ${child.status}): ${err}`);
        }

        const stdout = child.stdout.toString().trim();
        const jsonLine = stdout.split('\n').pop();

        try {
            const rawMap = JSON.parse(jsonLine);
            for (const [fileKey, libMap] of Object.entries(rawMap)) {
                this.results[fileKey] = {};
                for (const [libKey, samples] of Object.entries(libMap)) {
                    this.results[fileKey][libKey] = RoundtripResults.fromJSON(samples);
                }
            }
        } catch (e) {
            throw new Error(`Failed to parse benchmark results: ${e.message}\nOutput: ${stdout}`);
        }

        return this.results;
    }
}

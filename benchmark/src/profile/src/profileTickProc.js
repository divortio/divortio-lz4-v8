/**
 * benchmark/src/profile/src/profileTickProc.js
 * 
 * Processes a tick log file into JSON using --prof-process.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import { ProfileBase } from './profileBase.js';
import { ProfileTickProcFile } from './outputs/profileTickProcFile.js';
import { ProfileTickProcJsonFile } from './outputs/profileTickProcJsonFile.js';

export class ProfileTickProc extends ProfileBase {
    /**
     * @param {string} libraryName 
     * @param {object} config 
     * @param {ProfileTickFile} tickFile 
     */
    constructor(libraryName, config, tickFile) {
        super(libraryName, config);
        this.tickFile = tickFile;
        // Use matching timestamp from tickFile
        this.startTimestamp = tickFile.timestamp;

        this.outputFile = new ProfileTickProcFile(tickFile.dir, libraryName, this.startTimestamp);
        // We'll also support JSON output explicitly
        this.outputJsonFile = new ProfileTickProcJsonFile(tickFile.dir, libraryName, this.startTimestamp);
    }

    run() {
        if (!this.tickFile.exists()) {
            throw new Error(`Tick file not found: ${this.tickFile.path}`);
        }

        // 1. Generate Human Readable (Default)
        const argsHuman = ['--prof-process', this.tickFile.path];
        this._runProcess(argsHuman, this.outputFile.path);

        // 2. Generate JSON: node --prof-process --preprocess <log>
        const argsJson = ['--prof-process', '--preprocess', this.tickFile.path];
        this._runProcess(argsJson, this.outputJsonFile.path);

        return {
            text: this.outputFile,
            json: this.outputJsonFile
        };
    }

    _runProcess(args, outputPath) {
        console.error(`[ProfileTickProc] Processing: node ${args.join(' ')}`);
        const result = spawnSync(process.execPath, args, {
            encoding: 'utf8',
            maxBuffer: 100 * 1024 * 1024
        });

        if (result.error) throw result.error;
        if (result.status !== 0) {
            console.error(result.stderr);
            throw new Error(`ProfileTickProc failed with exit code ${result.status}`);
        }
        fs.writeFileSync(outputPath, result.stdout);
        console.error(`[ProfileTickProc] Generated: ${outputPath}`);
    }
}

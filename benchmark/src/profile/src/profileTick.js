/**
 * benchmark/src/profile/src/profileTick.js
 * 
 * Executes the benchmark command with --prof to generate a tick log.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProfileBase } from './profileBase.js';
import { ProfileTickFile } from './outputs/profileTickFile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ProfileTick extends ProfileBase {
    /**
     * @param {string} libraryName 
     * @param {object} config 
     * @param {string[]} commandArgs - Arguments for the underlying benchmark script
     * @param {string} scriptPath - Path to the benchmark script (e.g. benchCompressFilesCLI.js)
     */
    constructor(libraryName, config, commandArgs, scriptPath) {
        super(libraryName, config);
        this.commandArgs = commandArgs;
        this.scriptPath = scriptPath;

        // Default Directory: benchmark/.cacheCorpus/profile/${safeLibName}
        // or config.diagnosticDirOverride
        const safeName = config.lib.safeName;
        const projectRoot = path.resolve(__dirname, '../../../..');
        const defaultDir = path.join(projectRoot, '.cacheCorpus', 'profile', safeName);

        this.outputDir = config.diagnosticDirOverride || defaultDir;

        // Output File
        this.outputFile = new ProfileTickFile(this.outputDir, this.libraryName, this.startTimestamp);
    }

    run() {
        this.outputFile.ensureDir();

        // Node Arguments
        const nodeArgs = [
            '--prof',
            '--no-logfile-per-isolate',
            `--logfile=${this.outputFile.path}`,

            // Note: --diagnostic-dir might not be needed if we set logfile explicitly? 
            // Docs say --logfile overrides name.
            // But let's set --diagnostic-dir as well just in case.
            `--diagnostic-dir=${this.outputDir}`,

            this.scriptPath,
            ...this.commandArgs
        ];

        console.error(`[ProfileTick] Running: node ${nodeArgs.join(' ')}`);

        // Spawn
        const result = spawnSync(process.execPath, nodeArgs, {
            stdio: ['ignore', 'pipe', 'inherit'], // Capture stdout, inherit stderr
            encoding: 'utf8'
        });

        if (result.error) throw result.error;
        if (result.status !== 0) {
            throw new Error(`ProfileTick failed with exit code ${result.status}`);
        }

        // Parse stdout for profileDuration
        if (result.stdout) {
            const lines = result.stdout.split('\n');
            for (const line of lines) {
                try {
                    if (line.trim().startsWith('{')) {
                        const data = JSON.parse(line);
                        if (data.profileDuration) {
                            this.outputFile.profileDuration = data.profileDuration;
                            console.error(`[ProfileTick] Captured Duration: ${data.profileDuration.toFixed(2)}ms`);
                        }
                    }
                } catch (e) {
                    // Ignore non-JSON lines
                }
            }
        }

        console.error(`[ProfileTick] Generated: ${this.outputFile.path}`);
        return this.outputFile;
    }
}

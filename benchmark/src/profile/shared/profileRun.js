/**
 * benchmark/src/profile/shared/profileRun.js
 * 
 * Orchestrator for running profile commands.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { ProfileV8 } from '../src/profileV8.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ProfileRun {
    /**
     * @param {object} config - ProfileConfig
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Executes the profile command.
     * @param {string} type - 'compress' | 'decompress' | 'roundtrip'
     * @returns {object} - Result paths
     */
    async execute(type) {
        const libName = this.config.lib.name;

        // Determine script path based on type
        // We reuse the BENCHMARK CLI scripts because they contain the logic.
        // We just listLibs them.
        let scriptPath;
        const benchRoot = path.resolve(__dirname, '../../bench');

        switch (type) {
            case 'compress':
                scriptPath = path.join(__dirname, '../workloads/profileCompressWorkload.js');
                break;
            case 'decompress':
                scriptPath = path.join(__dirname, '../workloads/profileDecompressWorkload.js');
                break;
            case 'roundtrip':
                scriptPath = path.join(__dirname, '../workloads/profileRoundtripWorkload.js');
                break;
            default:
                throw new Error(`Unknown profile type: ${type}`);
        }

        // Construct CLI args for the benchmark script
        // We need to passthrough: -l <lib> -i <inputs> -s <samples> -w <warmup>
        // Note: ProfileConfigInputs already resolved files, but the CLI expects paths or corpus names.
        // Since we resolved them, we can pass the raw input/corpus args again?
        // Or pass the resolved paths?
        // The Bench CLI supports file paths.

        const args = [];

        // Library
        args.push('-l', libName);

        // Inputs
        // The config has `files`, but we want to pass arguments that `bench*FilesCLI.js` understands.
        // It accepts -i (files) or -c (corpus).
        // Since `ProfileConfig` constructor took raw args, we might want to preserve them.
        // However, ProfileConfigInputs resolved them.
        // Let's pass the resolved file paths to ensure consistency.
        // Calculate Input Size (Pre-execution)
        // ProfileConfigInputs resolves files.
        const files = this.config.inputs.getFiles();
        let totalInputSize = 0;
        files.forEach(f => {
            args.push('-i', f.path);
            try {
                // f.size might be available or we need to stat?
                // InputFile/CorpusFile usually has .size (getter or prop)
                totalInputSize += f.size || 0;
            } catch (e) {
                // Ignore sizing error
            }
        });

        // Samples/Warmups
        if (this.config.samples) args.push('-s', this.config.samples);
        if (this.config.warmups) args.push('-w', this.config.warmups);

        // Execute ProfileV8
        const profiler = new ProfileV8(libName, this.config, args, scriptPath);

        const start = Date.now();
        const outputs = profiler.run(); // { tick: ProfileTickFile, proc: ProfileTickProcFile }
        const end = Date.now();

        let duration = end - start;
        let totalSamples = this.config.samples + (this.config.warmups || 0);

        if (outputs.tick && outputs.tick.profileDuration) {
            duration = outputs.tick.profileDuration;
            // If using precise duration, it EXCLUDES warmups (based on workload impl)
            // So we should calculate processed size based on SAMPLES only.
            totalSamples = this.config.samples;
        }

        const totalProcessedSize = totalInputSize * totalSamples;

        // Construct Result Object
        // lazy import of classes? Or we can just import at top.
        // Importing dynamically to handle circular dependency if any? No.
        // Let's rely on simple string or dynamic import inside switch if convenient.
        // Actually best to import at top. I'll use standard names.

        let ResultClass;
        switch (type) {
            case 'compress':
                const { ProfileCompressResult } = await import('../../result/profile/profileCompressResult.js');
                ResultClass = ProfileCompressResult;
                break;
            case 'decompress':
                const { ProfileDecompressResult } = await import('../../result/profile/profileDecompressResult.js');
                ResultClass = ProfileDecompressResult;
                break;
            case 'roundtrip':
                const { ProfileRoundtripResult } = await import('../../result/profile/profileRoundtripResult.js');
                ResultClass = ProfileRoundtripResult;
                break;
        }

        return new ResultClass(
            libName,
            totalProcessedSize,
            duration,
            outputs.tick.path,
            outputs.proc.path
        );
    }
}

/**
 * benchmark/src/cli/cliProfile.js
 * 
 * CLI Handling for 'profile' command.
 */

import { parseArgs } from '../../../profile/shared/profileCLI.js';
import { ProfileConfig } from '../../../profile/shared/profileConfig.js';
import { ProfileRun } from '../../../profile/shared/profileRun.js';
import { ProfileResults } from '../../../result/profile/profileResults.js';

/**
 * Validates and runs the profile command.
 * @param {string} subcommand - 'compress', 'decompress', 'roundtrip'
 */
export async function run(subcommand) {
    try {
        // Parse args using shared logic (whitelisting done in Config)
        const args = parseArgs();

        if (args.isHelp) {
            // Check cliHelp.js or handle here?
            // Usually dispatched to help. For now, print usage.
            console.log(`Usage: bench.js profile ${subcommand} -l <lib> ...`);
            process.exit(0);
        }

        // Create Configuration
        const config = new ProfileConfig({
            libraries: args.libraryNames,
            inputs: args.inputNames,
            corpora: args.corpusNames,
            samples: args.samples,
            warmups: args.warmups,
            // Map CLI args to ProfileConfig options
            // --dir -> diagnosticDir
            diagnosticDir: args.directory,
            // --output -> could also be logFile if provided, but --log is more specific for 'log file'.
            // Let's allow --output too if --log not present?
            // Prioritize --log.
            // logFile: args.logPath || args.output 
            formats: args.formats,
            meta: args.meta,
            metaMd: args.metaMd
        });

        console.error(`\nProfiling ${subcommand} with ${config.lib.name}...`);

        const profileResults = new ProfileResults(config);

        const runner = new ProfileRun(config);
        const result = await runner.execute(subcommand);

        profileResults.addResult(result);
        profileResults.setEndTime();

        // Output JSON to stdout (console.log)
        console.log(JSON.stringify(profileResults.toJSON(), null, 2));

    } catch (error) {
        console.error(`\nProfile Error: ${error.message}`);
        process.exit(1);
    }
}

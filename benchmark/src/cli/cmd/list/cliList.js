/**
 * benchmark/src/cli/cliList.js
 * 
 * General List Command Handler.
 * Dispatches to specific listCorpora implementations.
 */

import {listLibs} from './cliListLibs.js';
import {listCorpus} from './cliListCorpus.js';

export function run(args) {
    // If the command was 'listCorpora', we check the first unknown arg for sub-command
    // e.g. bench.js listCorpora libs

    // However, cliArgs might have consumed 'libs' as unknown[0].

    const subCommand = (args.unknown && args.unknown.length > 0) ? args.unknown[0] : null;

    // Shift the unknown array so the filters work correctly in sub-handlers?
    // cliListLibs expects args.unknown[0] to be filter.
    // If we call it from here, args.unknown[0] is 'libs'.
    // We should copy args and shift unknown.

    const subArgs = { ...args };
    if (subCommand) {
        subArgs.unknown = args.unknown.slice(1);
    }

    if (!subCommand) {
        console.log('Usage: bench.js listCorpora <libs|corpus> [options]');
        return;
    }

    switch (subCommand.toLowerCase()) {
        case 'libs':
        case 'libraries':
            listLibs(subArgs);
            break;
        case 'corpus':
        case 'corpora':
            cliListCorpus.run(subArgs);
            break;
        default:
            console.error(`Unknown list category: ${subCommand}`);
            console.log('Available: libs, corpus');
    }
}

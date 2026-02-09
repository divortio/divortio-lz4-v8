/**
 * benchmark/src/cli/cliArgs.js
 * 
 * Handles parsing of command-line arguments for the Benchmark CLI.
 * Supports: --input, --corpus, --library, --samples, --warmup, --help
 */

export function parseArgs(rawArgs) {
    const args = rawArgs || process.argv.slice(2);

    // Separate command (first arg) from flags
    const command = args.length > 0 && !args[0].startsWith('-') ? args[0] : null;
    const flagArgs = command ? args.slice(1) : args;

    const config = {
        command: command, // compress, decompress, roundtrip
        libraryNames: [],
        inputNames: [],
        corpusNames: [],
        samples: 5,
        warmups: 2,
        formats: ['md'],
        output: null,
        directory: null,
        prefix: null,
        isAppend: false,
        noHeader: false,
        filterEnvironment: null,
        filterLanguage: null,
        isHelp: false,
        unknown: [],
        dryRun: false,
        log: false,
        logPath: null,
        logFormat: 'json',
        name: null // For buildCorpus --name
    };

    for (let i = 0; i < flagArgs.length; i++) {
        const arg = flagArgs[i];
        const next = flagArgs[i + 1];

        // Helper to check if next is a value (not a flag)
        const hasEffectiveNext = next && !next.startsWith('-');

        switch (arg) {
            case '--library':
            case '-l':
                if (hasEffectiveNext) {
                    config.libraryNames.push(next);
                    i++;
                }
                break;
            case '--input':
            case '-i':
                if (hasEffectiveNext) {
                    config.inputNames.push(next);
                    i++;
                }
                break;
            case '--corpus':
            case '-c':
                if (hasEffectiveNext) {
                    config.corpusNames.push(next);
                    i++;
                }
                break;
            case '--samples':
            case '-s':
                if (hasEffectiveNext) {
                    config.samples = parseInt(next, 10);
                    i++;
                }
                break;
            case '--warmup':
            case '--warmups':
            case '-w':
                if (hasEffectiveNext) {
                    config.warmups = parseInt(next, 10);
                    i++;
                }
                break;
            case '--output':
            case '-o': // Assuming -o alias
                if (hasEffectiveNext) {
                    config.output = next; // Can be file or dir
                    i++;
                }
                break;
            case '--dir':
            case '--directory':
                if (hasEffectiveNext) {
                    config.directory = next;
                    i++;
                }
                break;
            case '--prefix':
                if (hasEffectiveNext) {
                    config.prefix = next;
                    i++;
                }
                break;
            case '--append':
                config.isAppend = true;
                break;
            case '--no-header':
                config.noHeader = true;
                break;
            case '--environment':
            case '--env':
                if (hasEffectiveNext) {
                    config.filterEnvironment = next;
                    i++;
                }
                break;
            case '--language':
            case '--lang':
                if (hasEffectiveNext) {
                    config.filterLanguage = next;
                    i++;
                }
                break;
            case '--format':
            case '-f':
                if (hasEffectiveNext) {
                    // Support comma separated? "md,csv"
                    // Or repeated?
                    // Let's support both logic or just simple string for now.
                    // User said "various types", implying maybe multiple.
                    // Let's treat it as repeated or comma.
                    const parts = next.split(',');
                    if (config.formats.length === 1 && config.formats[0] === 'md') {
                        // Reset default if user provides any
                        config.formats = [];
                    }
                    config.formats.push(...parts);
                    i++;
                }
                break;
            case '--help':
            case '-h':
                config.isHelp = true;
                break;
            case '--dry-listLibs':
                config.dryRun = true;
                break;
            case '--log':
                config.log = true;
                if (hasEffectiveNext) {
                    config.logPath = next;
                    i++;
                }
                break;
            case '--log-format':
                if (hasEffectiveNext) {
                    const fmt = next.toLowerCase();
                    if (['json', 'csv', 'tsv'].includes(fmt)) {
                        config.logFormat = fmt;
                    } else {
                        console.warn(`Warning: Invalid log format '${next}'. Using 'json'.`);
                    }
                    i++;
                }
            case '--log-format':
                if (hasEffectiveNext) {
                    // ... (handled above)
                }
                break;
            case '--name': // Explicit case for buildCorpus
                if (hasEffectiveNext) {
                    config.name = next;
                    i++;
                }
                break;
            default:
                // Handle flags not recognized or value-less flags?
                config.unknown.push(arg);
                break;
        }
    }

    return config;
}

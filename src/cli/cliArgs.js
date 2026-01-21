/**
 * src/cli/cliArgs.js
 * 
 * Argument parser for the LZ4-Divortio CLI (lz4CLI.js).
 * Responsible for parsing raw command line arguments and producing a CLIConfig object.
 */

import { CLIConfig } from './cliConfig.js';

/**
 * Parses command-line arguments and returns a configuration object.
 * 
 * @param {string[]} [rawArgs] - Optional raw arguments array (defaults to process.argv.slice(2)).
 * @returns {CLIConfig} The configuration object.
 */
export function parseArgs(rawArgs) {
    const args = rawArgs || process.argv.slice(2);

    // Command defaulting
    let command = 'compress';
    if (args.length > 0) {
        if (args[0] === 'compress' || args[0] === 'c') {
            command = 'compress';
            args.shift();
        } else if (args[0] === 'decompress' || args[0] === 'd' || args[0] === '-d' || args[0] === '--decompress') {
            command = 'decompress';
            args.shift();
        }
    }

    const options = {
        command: command,
        unknown: []
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];
        const hasEffectiveNext = next && !next.startsWith('-');

        switch (arg) {
            case '-h':
            case '--help':
                options.isHelp = true;
                break;
            case '--json':
                options.json = true;
                break;
            case '--log':
                options.log = true;
                if (hasEffectiveNext) {
                    options.logPath = next;
                    i++;
                }
                break;
            case '--log-format':
                if (hasEffectiveNext) {
                    options.logFormat = next.toLowerCase();
                    i++;
                }
                break;
            case '-v':
            case '--verbose':
                options.verbose = true;
                break;
            case '-f':
            case '--force':
                options.force = true;
                break;
            case '-k':
            case '--keep':
                options.keep = true;
                break;
            case '--rm':
                options.keep = false;
                break;

            // Output
            case '-o':
            case '--output':
                if (hasEffectiveNext) {
                    options.output = next;
                    i++;
                }
                break;

            // Dictionary
            case '-D':
            case '--dictionary':
                if (hasEffectiveNext) {
                    options.dictionary = next;
                    i++;
                }
                break;

            // Compression: Block Size
            case '-B':
            case '--block-size':
                if (hasEffectiveNext) {
                    options.blockSize = parseBlockSize(next);
                    i++;
                }
                break;

            // Flags
            case '--independent-blocks':
            case '-i':
                options.blockIndependence = true;
                break;
            case '--content-checksum':
                options.contentChecksum = true;
                break;
            case '--no-frame-content-size':
                options.addContentSize = false;
                break;

            case '--verify-checksum':
                options.verifyChecksum = true;
                break;

            // Positional (Input)
            default:
                if (!arg.startsWith('-')) {
                    if (!options.input) {
                        options.input = arg;
                    } else {
                        console.warn(`Warning: Multiple inputs not supported yet, ignoring '${arg}'`);
                    }
                } else {
                    console.warn(`Warning: Unknown argument '${arg}'`);
                }
                break;
        }
    }

    // Pass parsed options to CLIConfig which handles defaults and validation logic
    return new CLIConfig(options);
}

/**
 * Parses block size string to bytes.
 * Support 'k', 'kb', 'm', 'mb' suffixes.
 * 
 * @param {string} str - The block size string (e.g. "4MB", "64k").
 * @returns {number} Block size in bytes.
 */
function parseBlockSize(str) {
    const s = str.toLowerCase();
    if (s.endsWith('m') || s.endsWith('mb')) return parseInt(s) * 1024 * 1024;
    if (s.endsWith('k') || s.endsWith('kb')) return parseInt(s) * 1024;
    const val = parseInt(s);

    // Map to standard block sizes if explicit match logic needed, 
    // but config just stores the number. 
    // lz4-js usually snaps to nearest valid size or validates it.
    // We return the raw parsed number here, assuming the library handles it or we snap it.
    // Existing logic snapped:
    if (val <= 65536) return 65536;
    if (val <= 262144) return 262144;
    if (val <= 1048576) return 1048576;
    return 4194304;
}

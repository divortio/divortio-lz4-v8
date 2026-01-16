/**
 * src/cli/cliArgs.js
 * 
 * Argument parser for the LZ4-Divortio CLI (lz4CLI.js).
 */

import fs from 'fs';
import path from 'path';

export function parseArgs(rawArgs) {
    const args = rawArgs || process.argv.slice(2);

    // Command defaulting
    let command = 'compress'; // Default to compress if file provided? Or require command?
    // "lz4 file" -> compresses. "lz4 -d file" -> decompresses.
    // "lz4 compress file" -> compresses.
    // Let's look at first arg.
    if (args.length > 0) {
        if (args[0] === 'compress' || args[0] === 'c') {
            command = 'compress';
            args.shift();
        } else if (args[0] === 'decompress' || args[0] === 'd' || args[0] === '-d' || args[0] === '--decompress') {
            command = 'decompress';
            args.shift();
        }
        // Else assume implicit compress if it's a file, UNLESS -d flag was handled above
    }

    const config = {
        command: command,
        input: null,
        output: null,
        force: false,       // Overwrite output
        keep: true,         // Keep input file (default true)
        verbose: false,
        json: false,
        log: false,
        logPath: null,
        logFormat: 'json',

        // Compression Options
        blockSize: 4194304, // 4MB default
        dictionary: null,   // Path to dictionary file
        blockIndependence: false,
        contentChecksum: false,
        addContentSize: true,

        // Decompression Options
        verifyChecksum: false,

        isHelp: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];
        const hasEffectiveNext = next && !next.startsWith('-');

        switch (arg) {
            case '-h':
            case '--help':
                config.isHelp = true;
                break;
            case '--json':
                config.json = true;
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
                break;
            case '-v':
            case '--verbose':
                config.verbose = true;
                break;
            case '-f':
            case '--force':
                config.force = true;
                break;
            case '-k':
            case '--keep':
                config.keep = true; // Explicitly set
                break;
            case '--rm':
                config.keep = false; // Delete input (like gzip)
                break;

            // Output
            case '-o':
            case '--output':
                if (hasEffectiveNext) {
                    config.output = next;
                    i++;
                }
                break;

            // Dictionary
            case '-D': // -D is standard in lz4 cli
            case '--dictionary':
                if (hasEffectiveNext) {
                    config.dictionary = next;
                    i++;
                }
                break;

            // Compression: Block Size
            case '-B':
            case '--block-size': // -B4, -B5 etc in lz4. Here we take bytes or k/m suffix or ID?
                if (hasEffectiveNext) {
                    config.blockSize = parseBlockSize(next);
                    i++;
                }
                break;
            // --fast / --best ? (LZ4 JS doesn't support acceleration levels yet in buffer API?)
            // Ignore for now.

            // Compression Flags
            case '--independent-blocks':
            case '-i': // -i usually implies independent
                config.blockIndependence = true;
                break;
            case '--content-checksum':
                config.contentChecksum = true;
                break;
            case '--no-frame-content-size':
                config.addContentSize = false;
                break;

            // Decompression Flags
            case '--verify-checksum':
                config.verifyChecksum = true;
                break;

            // Positional (Input)
            default:
                if (!arg.startsWith('-')) {
                    if (!config.input) {
                        config.input = arg;
                    } else {
                        // Multiple inputs? For now support single file.
                        console.warn(`Warning: Multiple inputs not supported yet, ignoring '${arg}'`);
                    }
                } else {
                    console.warn(`Warning: Unknown argument '${arg}'`);
                }
                break;
        }
    }

    // Default Output Filename Logic
    if (config.input && !config.output) {
        if (config.command === 'compress') {
            config.output = `${config.input}.lz4`;
        } else if (config.command === 'decompress') {
            if (config.input.endsWith('.lz4')) {
                config.output = config.input.substring(0, config.input.length - 4);
            } else {
                config.output = `${config.input}.out`;
            }
        }
    }

    return config;
}

function parseBlockSize(str) {
    const s = str.toLowerCase();
    if (s.endsWith('m') || s.endsWith('mb')) return parseInt(s) * 1024 * 1024;
    if (s.endsWith('k') || s.endsWith('kb')) return parseInt(s) * 1024;
    const val = parseInt(s);
    // Align to supported sizes logic in bufferCompress (It finds closest? Or we pass explicitly)
    // lz4.js: "maxBlockSize"
    // Supported: 64KB (65536), 256KB (262144), 1MB (1048576), 4MB (4194304)
    // Map to closest?
    if (val <= 65536) return 65536;
    if (val <= 262144) return 262144;
    if (val <= 1048576) return 1048576;
    return 4194304;
}

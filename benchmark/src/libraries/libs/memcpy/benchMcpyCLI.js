#!/usr/bin/env node

/**
 * @fileoverview Production-Grade CLI for Memcpy/LZ4 Throughput Benchmarking.
 * * FEATURES:
 * - ESM Architecture.
 * - Robust Argument Parsing.
 * - Environment Fingerprinting.
 * - JSON/CSV/TSV/Table Outputs.
 * - Strict Formatting and Precision Control.
 */

import os from 'node:os';
import process from 'node:process';
import bench from './benchMemcpy.js';

// -----------------------------------------------------------------------------
// Configuration & Registry
// -----------------------------------------------------------------------------

const APP_NAME = 'benchMemcpy';
const VERSION = '1.0.8';

// Command Registry
const COMMANDS = {
    all: { desc: 'Run complete benchmark suite', fn: bench.runAllBenchmarks },
    wild: { desc: 'Wild Memcpy (8-byte unrolled)', fn: bench.runWildBenchmark },
    wide: { desc: 'Wide Memcpy (64-bit aligned Float64)', fn: bench.runFloat64Benchmark },
    native: { desc: 'Native Memcpy (V8 Intrinsic)', fn: bench.runNativeBenchmark },
    naive: { desc: 'Naive Memcpy (Byte loop)', fn: bench.runNaiveBenchmark },

    // Read Group
    'read-bitwise': { desc: 'Read U32 (Bitwise Shift)', fn: bench.runReadU32Bitwise },
    'read-dataview': { desc: 'Read U32 (DataView)', fn: bench.runReadU32DataView },
    'read-u64': { desc: 'Read U64 (DataView BigInt)', fn: bench.runReadU64DataView },

    // Write/Copy Group
    'write-u32': { desc: 'Write U32 (DataView)', fn: bench.runWriteU32DataView },
    'write-u64': { desc: 'Write U64 (DataView BigInt)', fn: bench.runWriteU64DataView },
    'copy-u64': { desc: 'Copy U64 (DataView Get+Set)', fn: bench.runCopyU64DataView },

    // Match Group
    'match-byte': { desc: 'Match Extension (Byte)', fn: bench.runMatchByte },
    'match-word': { desc: 'Match Extension (Word)', fn: bench.runMatchWord },
    'match-u32-dataview': { desc: 'Match Extension (U32 DataView)', fn: bench.runMatchU32DataView }, // NEW
    'match-u64': { desc: 'Match Extension (U64 BigInt)', fn: bench.runMatchU64 },

    // Compress Group
    compress: { desc: 'Compress (Byte loop)', fn: bench.runLz4CompressBenchmark },
    compress8: { desc: 'Compress (8-byte unrolled)', fn: bench.runLz4CompressBenchmark8 },
    'compress-dataview': { desc: 'Compress (DataView Read)', fn: bench.runLz4CompressBenchmarkDataView },
    'compress-dataview-write': { desc: 'Compress (DataView Read + Write)', fn: bench.runLz4CompressBenchmarkDataViewWrite },

    decompress: { desc: 'Decompress (Windowed)', fn: bench.runLz4DecompressBenchmark }
};

// ... (Rest of CLI logic: getSystemInfo, formatRows, toDSV, printOutput, ArgParser, main) ...
// (Retaining existing logic for brevity)

// -----------------------------------------------------------------------------
// Utilities: System & Formatting
// -----------------------------------------------------------------------------

function getSystemInfo() {
    const cpus = os.cpus();
    const cpuModel = cpus.length ? cpus[0].model : 'Unknown CPU';

    return {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        v8Version: process.versions.v8,
        platform: `${os.type()} ${os.release()} ${os.arch()}`,
        cpu: `${cpuModel} (${cpus.length} cores)`
    };
}

function formatRows(results) {
    const list = Array.isArray(results) ? results : [results];

    return list.map((r, i) => {
        const sizeMB = r.bytes / (1024 * 1024);

        return {
            idx: i + 1,
            library: r.library,
            operation: r.operation,
            MB: sizeMB.toFixed(3),
            ms: r.duration.toFixed(3),
            MBs: r.MBs.toFixed(1)
        };
    });
}

function toDSV(formattedRows, delimiter, headersEnabled) {
    const lines = [];

    if (headersEnabled) {
        const headers = ['idx', 'library', 'operation', 'MB', 'ms', 'MBs'];
        lines.push(headers.join(delimiter));
    }

    for (const r of formattedRows) {
        lines.push([
            r.idx,
            r.library,
            r.operation,
            r.MB,
            r.ms,
            r.MBs
        ].join(delimiter));
    }
    return lines.join('\n');
}

function printOutput(rawResults, format, headersEnabled, sysInfo) {
    if (format === 'json') {
        const formatted = formatRows(rawResults);
        console.log(JSON.stringify({ meta: sysInfo, results: formatted }, null, 2));
        return;
    }

    const formattedRows = formatRows(rawResults);

    if (format === 'csv') {
        console.log(toDSV(formattedRows, ',', headersEnabled));
        return;
    }

    if (format === 'tsv') {
        console.log(toDSV(formattedRows, '\t', headersEnabled));
        return;
    }

    // Default: Table
    console.log(`\nBENCHMARK REPORT`);
    console.log(`----------------------------------------`);
    console.log(`Node : ${sysInfo.nodeVersion} (V8 ${sysInfo.v8Version})`);
    console.log(`CPU  : ${sysInfo.cpu}`);
    console.log(`OS   : ${sysInfo.platform}`);
    console.log(`----------------------------------------\n`);

    console.table(formattedRows);
}

// -----------------------------------------------------------------------------
// Core: Argument Parser
// -----------------------------------------------------------------------------

class ArgParser {
    constructor() {
        this.args = process.argv.slice(2);
        this.flags = {
            size: null,
            samples: bench.DEFAULT_SAMPLES,
            warmups: bench.DEFAULT_WARMUPS,
            format: 'table',
            headers: true,
            help: false
        };
        this.command = 'all';
    }

    parse() {
        let skipNext = false;
        let sizeSet = false;

        for (let i = 0; i < this.args.length; i++) {
            if (skipNext) { skipNext = false; continue; }

            const arg = this.args[i];

            if (arg.startsWith('--')) {
                const key = arg.slice(2);

                if (key === 'help') {
                    this.flags.help = true;
                    return;
                }

                if (key === 'no-headers') {
                    this.flags.headers = false;
                    continue;
                }

                if (key === 'json') { this.flags.format = 'json'; continue; }
                if (key === 'csv')  { this.flags.format = 'csv'; continue; }
                if (key === 'tsv')  { this.flags.format = 'tsv'; continue; }

                if (['size', 'mb', 'kb', 'samples', 'warmups', 'format'].includes(key)) {
                    const val = this.args[i + 1];
                    if (!val || val.startsWith('--')) {
                        throw new Error(`Flag --${key} requires a value.`);
                    }

                    if (key === 'format') {
                        if (!['table', 'json', 'csv', 'tsv'].includes(val)) {
                            throw new Error(`Invalid format: ${val}.`);
                        }
                        this.flags.format = val;
                    } else {
                        const num = parseFloat(val);
                        if (isNaN(num) || num <= 0) {
                            throw new Error(`Invalid value for --${key}: ${val}`);
                        }

                        if (['size', 'mb', 'kb'].includes(key)) {
                            if (sizeSet) throw new Error(`Cannot specify multiple size flags.`);
                            sizeSet = true;

                            if (key === 'size') this.flags.size = Math.floor(num);
                            if (key === 'mb')   this.flags.size = Math.floor(num * 1024 * 1024);
                            if (key === 'kb')   this.flags.size = Math.floor(num * 1024);
                        } else {
                            this.flags[key] = Math.floor(num);
                        }
                    }
                    skipNext = true;
                } else {
                    throw new Error(`Unknown flag: ${arg}`);
                }
                continue;
            }

            if (COMMANDS[arg]) {
                this.command = arg;
            } else {
                throw new Error(`Unknown command: ${arg}`);
            }
        }

        if (!this.flags.size) {
            this.flags.size = bench.DEFAULT_SIZE;
        }
    }
}

// -----------------------------------------------------------------------------
// Helper: Help Menu
// -----------------------------------------------------------------------------

function printHelp() {
    console.log(`
${APP_NAME} v${VERSION}
High-performance V8 Memory Throughput Benchmark.

USAGE
  node benchMemcpyCLI.js [command] [options]

COMMANDS`);

    for (const [name, cmd] of Object.entries(COMMANDS)) {
        console.log(`  ${name.padEnd(14)} ${cmd.desc}`);
    }

    console.log(`
OPTIONS
  --size <n>    Size in bytes (Default: ${bench.DEFAULT_SIZE})
  --mb <n>      Size in MB (ex: 2.5)
  --kb <n>      Size in KB (ex: 500)
  --samples <n> Measurement iterations (Default: ${bench.DEFAULT_SAMPLES})
  --warmups <n> V8 optimization iterations (Default: ${bench.DEFAULT_WARMUPS})
  
FORMATTING
  --format <f>  Output format: table, json, csv, tsv (Default: table)
  --json        Alias for --format json
  --csv         Alias for --format csv
  --tsv         Alias for --format tsv
  --no-headers  Suppress headers in CSV/TSV output
  --help        Show this help message
`);
}

function main() {
    const parser = new ArgParser();

    try {
        parser.parse();

        if (parser.flags.help) {
            printHelp();
            process.exit(0);
        }

        const cmdName = parser.command;
        const cmdConfig = COMMANDS[cmdName];
        const { size, samples, warmups, format, headers } = parser.flags;

        if (format === 'table') {
            const sizeMB = (size / (1024*1024)).toFixed(2);
            console.log(`Running ${cmdName} (size=${size} [${sizeMB} MB], samples=${samples})...`);
        }

        const results = cmdConfig.fn(size, samples, warmups);
        const sysInfo = getSystemInfo();
        printOutput(results, format, headers, sysInfo);

    } catch (err) {
        console.error(`\nERROR: ${err.message}`);
        console.error(`Try 'node benchMemcpyCLI.js --help' for usage.\n`);
        process.exit(1);
    }
}

main();
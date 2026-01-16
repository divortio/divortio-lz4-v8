/**
 * src/cli/cliDecompress.js
 * 
 * Decompression handler for LZ4 CLI.
 */

import fs from 'fs';
import path from 'path';
import { LZ4 } from '../lz4.js';
import {
    formatBytes, formatDuration, formatThroughput, formatRatio,
    calculateThroughput, calculateRatioPct, round
} from './cliUtils.js';
import { writeLog } from './cliLog.js';

export function run(config) {
    if (config.log) config.verbose = true;

    if (!config.input) {
        console.error("Error: Input file required.");
        process.exit(1);
    }

    if (!fs.existsSync(config.input)) {
        console.error(`Error: Input file '${config.input}' not found.`);
        process.exit(1);
    }

    if (fs.existsSync(config.output) && !config.force) {
        console.error(`Error: Output file '${config.output}' already exists. Use -f to overwrite.`);
        process.exit(1);
    }

    // Load Dictionary
    let dict = null;
    if (config.dictionary) {
        if (fs.existsSync(config.dictionary)) {
            dict = fs.readFileSync(config.dictionary);
        } else {
            console.error(`Error: Dictionary file '${config.dictionary}' not found.`);
            process.exit(1);
        }
    }

    try {
        const sysTimeStart = new Date();
        const totalStart = performance.now();
        const absInput = path.resolve(config.input);
        const absOutput = path.resolve(config.output);

        // 1. Read
        const tReadStart = performance.now();
        const inputBuf = fs.readFileSync(config.input);
        const tReadEnd = performance.now();
        const readMs = tReadEnd - tReadStart;

        // 2. Decompress
        const tDecompStart = performance.now();
        const decompressed = LZ4.decompress(
            inputBuf,
            dict,
            config.verifyChecksum
        );
        const tDecompEnd = performance.now();
        const decompMs = tDecompEnd - tDecompStart;

        // 3. Write
        const tWriteStart = performance.now();
        fs.writeFileSync(config.output, decompressed);
        const tWriteEnd = performance.now();
        const writeMs = tWriteEnd - tWriteStart;

        const totalEnd = performance.now();
        const totalMs = totalEnd - totalStart;
        const sysTimeEnd = new Date();

        const cmd = "node src/lz4CLI.js " + process.argv.slice(2).join(' ');
        const inSize = inputBuf.length;
        const outSize = decompressed.length;

        // Build Output Object
        const outputObj = {
            startTime: sysTimeStart.getTime(),
            startTimeH: sysTimeStart.toISOString(),
            endTime: sysTimeEnd.getTime(),
            endTimeH: sysTimeEnd.toISOString(),

            command: cmd,
            input: {
                path: absInput,
                size: inSize,
                sizeH: formatBytes(inSize)
            },
            read: {
                size: inSize,
                sizeH: formatBytes(inSize),
                durationMs: round(readMs),
                durationH: formatDuration(readMs),
                throughputMBps: round(calculateThroughput(inSize, readMs)),
                throughputH: formatThroughput(inSize, readMs)
            },
            decompress: {
                inputSize: inSize,
                inputSizeH: formatBytes(inSize),
                outputSize: outSize,
                outputSizeH: formatBytes(outSize),
                durationMs: round(decompMs),
                durationH: formatDuration(decompMs),
                throughputMBps: round(calculateThroughput(inSize, decompMs)), // Using Input size for processing throughput
                throughputH: formatThroughput(inSize, decompMs),
                ratioPct: round(calculateRatioPct(inSize, outSize)),
                ratioH: formatRatio(inSize, outSize)
            },
            write: {
                size: outSize,
                sizeH: formatBytes(outSize),
                durationMs: round(writeMs),
                durationH: formatDuration(writeMs),
                throughputMBps: round(calculateThroughput(outSize, writeMs)),
                throughputH: formatThroughput(outSize, writeMs)
            },
            processed: {
                command: "decompress",
                inputSize: inSize,
                inputSizeH: formatBytes(inSize),
                outputSize: outSize,
                outputSizeH: formatBytes(outSize),
                ratioPct: round(calculateRatioPct(inSize, outSize)),
                ratioH: formatRatio(inSize, outSize),
                durationMs: round(totalMs),
                durationH: formatDuration(totalMs),
                throughputMBps: round(calculateThroughput(inSize, totalMs)),
                throughputH: formatThroughput(inSize, totalMs)
            },
            output: {
                path: absOutput,
                size: outSize,
                sizeH: formatBytes(outSize)
            }
        };

        if (config.json) {
            console.log(JSON.stringify(outputObj));
        } else if (config.verbose) {
            console.log(`Command: ${cmd}`);
            console.log(`Input: "${absInput}" (${formatBytes(inSize)})`);
            console.log(`Read: ${formatBytes(inSize)} to Buffer in ${formatDuration(readMs)} (${formatThroughput(inSize, readMs)})`);
            console.log(`Decompress: ${formatBytes(inSize)} to ${formatBytes(outSize)} in ${formatDuration(decompMs)} (${formatThroughput(inSize, decompMs)}), ${formatRatio(inSize, outSize)} in size.`);
            console.log(`Wrote: ${formatBytes(outSize)} to File in ${formatDuration(writeMs)} (${formatThroughput(outSize, writeMs)})`);
            console.log(`Processed: ${formatBytes(inSize)} to ${formatBytes(outSize)} (${formatRatio(inSize, outSize)}) in ${formatDuration(totalMs)} (${formatThroughput(inSize, totalMs)})`);
            console.log(`Output: "${absOutput}"`);
        }

        if (config.log) {
            const logResult = writeLog(config, outputObj);
            if (logResult) {
                console.log(`Log: ${logResult.path} (${logResult.sizeH})`);
            }
        }

        if (!config.keep) {
            fs.unlinkSync(config.input);
            if (config.verbose && !config.json) console.log(`Deleted input file.`);
        }

    } catch (err) {
        console.error("Decompression Failed:", err.message);
        process.exit(1);
    }
}

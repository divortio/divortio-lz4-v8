/**
 * src/cli/cliDecompress.js
 * 
 * Decompression handler for the LZ4-Divortio CLI.
 * Orchestrates the file decompression process including reading, decompressing, and writing output.
 */

import fs from 'fs';
import path from 'path';
import { LZ4 } from '../lz4.js';
import { CliDecompressResults } from './cliDecompressResults.js';
import { writeLog } from './cliLog.js';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { formatBytes, formatDuration, formatThroughput, formatRatio } from './cliUtils.js';

/**
 * Executes the decompression command based on the provided configuration.
 * 
 * @param {import('./cliConfig.js').CLIConfig} config - The CLI configuration object.
 * @returns {void}
 */
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
        const results = new CliDecompressResults();
        results.setCommand(process.argv.slice(2));
        results.start();

        const absInput = path.resolve(config.input);
        const absOutput = path.resolve(config.output);

        // 1. Read
        const tReadStart = performance.now();
        const inputBuf = fs.readFileSync(config.input);
        const tReadEnd = performance.now();
        const readMs = tReadEnd - tReadStart;

        results.recordInput(absInput, inputBuf.length);
        results.recordRead(inputBuf.length, readMs);

        // 2. Decompress
        const tDecompStart = performance.now();
        const decompressed = LZ4.decompress(
            inputBuf,
            dict,
            config.verifyChecksum
        );
        const tDecompEnd = performance.now();
        const decompMs = tDecompEnd - tDecompStart;

        results.recordDecompress(inputBuf.length, decompressed.length, decompMs);

        // 3. Write
        const tWriteStart = performance.now();
        fs.writeFileSync(config.output, decompressed);
        const tWriteEnd = performance.now();
        const writeMs = tWriteEnd - tWriteStart;

        results.recordWrite(decompressed.length, writeMs);
        results.recordOutput(absOutput, decompressed.length);

        results.end();

        const outputObj = results.toJSON();

        if (config.json) {
            console.log(JSON.stringify(outputObj));
        } else if (config.verbose) {
            // Unpack stats for easier printing
            const iSize = outputObj.input.size;
            const oSize = outputObj.output.size;
            console.log(`Command: ${outputObj.command}`);
            console.log(`Input: "${outputObj.input.path}" (${outputObj.input.sizeH})`);
            console.log(`Read: ${outputObj.read.sizeH} to Buffer in ${outputObj.read.durationH} (${outputObj.read.throughputH})`);
            console.log(`Decompress: ${formatBytes(iSize)} to ${formatBytes(oSize)} in ${outputObj.decompress.durationH} (${outputObj.decompress.throughputH}), ${outputObj.decompress.ratioH} output size.`);
            console.log(`Wrote: ${outputObj.write.sizeH} to File in ${outputObj.write.durationH} (${outputObj.write.throughputH})`);
            console.log(`Processed: ${formatBytes(iSize)} to ${formatBytes(oSize)} (${outputObj.processed.ratioH}) in ${outputObj.processed.durationH} (${outputObj.processed.throughputH})`);
            console.log(`Output: "${outputObj.output.path}"`);
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

/**
 * Executes the decompression command using Streams.
 * @param {import('./cliConfig.js').CLIConfig} config - The CLI configuration object.
 */
export async function runStream(config) {
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
            const rawDict = fs.readFileSync(config.dictionary);
            dict = new LZ4Dictionary(rawDict);
        } else {
            console.error(`Error: Dictionary file '${config.dictionary}' not found.`);
            process.exit(1);
        }
    }

    try {
        const results = new CliDecompressResults();
        results.setCommand(process.argv.slice(2));
        results.start();

        const absInput = path.resolve(config.input);
        const absOutput = path.resolve(config.output);
        const inputStats = fs.statSync(config.input);
        const inputSize = inputStats.size;

        // Streams
        const source = createReadStream(config.input);
        const transform = LZ4.createDecompressStream(dict, config.verifyChecksum);
        const dest = createWriteStream(config.output);

        if (config.verbose) console.log(`Streaming decompression: ${config.input} -> ${config.output}`);

        const tStart = performance.now();

        await pipeline(source, transform, dest);

        const tEnd = performance.now();
        const duration = tEnd - tStart;

        // Gather Stats
        const outputStats = fs.statSync(config.output);
        const outputSize = outputStats.size;

        results.recordInput(absInput, inputSize);
        results.recordRead(inputSize, duration);
        results.recordDecompress(inputSize, outputSize, duration);
        results.recordWrite(outputSize, duration);
        results.recordOutput(absOutput, outputSize);

        results.end();

        const outputObj = results.toJSON();

        if (config.json) {
            console.log(JSON.stringify(outputObj));
        } else if (config.verbose) {
            console.log(`Stream Decompression Completed in ${outputObj.processed.durationH}`);
            console.log(`Input: ${formatBytes(inputSize)}`);
            console.log(`Output: ${formatBytes(outputSize)}`);
        }

        if (config.log) {
            const logResult = writeLog(config, outputObj);
            if (logResult) console.log(`Log: ${logResult.path}`);
        }

        if (!config.keep) {
            fs.unlinkSync(config.input);
            if (config.verbose && !config.json) console.log(`Deleted input file.`);
        }

    } catch (err) {
        console.error("Stream Decompression Failed:", err.message);
        process.exit(1);
    }
}

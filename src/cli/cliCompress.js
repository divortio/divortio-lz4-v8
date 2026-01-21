/**
 * src/cli/cliCompress.js
 * 
 * Compression handler for the LZ4-Divortio CLI.
 * Orchestrates the file compression process including reading, compressing, and writing output.
 */

import fs from 'fs';
import path from 'path';
import { LZ4 } from '../lz4.js';
import { LZ4Dictionary } from '../dictionary/LZ4Dictionary.js';
import { CliCompressResults } from './cliCompressResults.js';
import { writeLog } from './cliLog.js';
import { formatBytes, formatDuration, formatThroughput, formatRatio } from './cliUtils.js';

/**
 * Executes the compression command based on the provided configuration.
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

    // check input existence
    if (!fs.existsSync(config.input)) {
        console.error(`Error: Input file '${config.input}' not found.`);
        process.exit(1);
    }

    // check output overwrite
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
        const results = new CliCompressResults();
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

        // 2. Compress
        const tCompStart = performance.now();
        const compressed = LZ4.compress(
            inputBuf,
            dict,
            config.blockSize,
            config.blockIndependence,
            config.contentChecksum,
            config.addContentSize
        );
        const tCompEnd = performance.now();
        const compMs = tCompEnd - tCompStart;

        results.recordCompress(inputBuf.length, compressed.length, compMs);

        // 3. Write
        const tWriteStart = performance.now();
        fs.writeFileSync(config.output, compressed);
        const tWriteEnd = performance.now();
        const writeMs = tWriteEnd - tWriteStart;

        results.recordWrite(compressed.length, writeMs);
        results.recordOutput(absOutput, compressed.length);

        results.end();

        const outputObj = results.toJSON();

        if (config.json) {
            console.log(JSON.stringify(outputObj));
        } else if (config.verbose) {
            const iSize = outputObj.input.size;
            const oSize = outputObj.output.size;
            console.log(`Command: ${outputObj.command}`);
            console.log(`Input: "${outputObj.input.path}" (${outputObj.input.sizeH})`);
            console.log(`Read: ${outputObj.read.sizeH} to Buffer in ${outputObj.read.durationH} (${outputObj.read.throughputH})`);
            console.log(`Compress: ${formatBytes(iSize)} to ${formatBytes(oSize)} in ${outputObj.compress.durationH} (${outputObj.compress.throughputH}), ${outputObj.compress.ratioH} output size.`);
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
        console.error("Compression Failed:", err.message);
        process.exit(1);
    }
}
/**
 * benchmark/src/cli/cliOutput.js
 * 
 * Central logic for resolving output paths, filenames, and formats.
 */

import fs from 'fs';
import path from 'path';

/**
 * Resolves the final output configuration based on CLI arguments.
 * @param {object} args - Parsed arguments from cliArgs.js
 * @returns {object} { dir, baseFilename, formats, isAppend, noHeader }
 */
export function resolveOutputConfig(args) {
    const cwd = process.cwd();
    const defaultDir = path.join(cwd, 'benchmark/results');

    let typePrefix = 'report';
    if (args.command === 'compress') typePrefix = 'comp';
    else if (args.command === 'decompress') typePrefix = 'decp';
    else if (args.command === 'roundtrip') typePrefix = 'rndt';

    let targetDir = defaultDir;
    let baseFilename = `${typePrefix}_${Date.now()}`;
    const formats = new Set(args.formats); // Start with explicit formats

    // 1. Analyze --output (if provided)
    let outputIsDir = false;
    let outputFormat = null;
    let outputBase = null;

    if (args.output) {
        const outPath = path.resolve(cwd, args.output);
        let status = null;
        try {
            status = fs.statSync(outPath);
        } catch (e) {
            // Path doesn't exist yet
        }

        if (status && status.isDirectory()) {
            outputIsDir = true;
            targetDir = outPath;
        } else {
            // It's a file path (existing or new)
            // Check for trailing slash to infer dir if not exists? 
            // User said "valid directory", implying existence. 
            // If it doesn't exist, we usually treat as file unless ends in /
            if (args.output.endsWith(path.sep) || args.output.endsWith('/')) {
                outputIsDir = true;
                targetDir = outPath;
            } else {
                // Treat as file
                const parsed = path.parse(outPath);
                // If it has an extension?
                if (parsed.ext) {
                    const ext = parsed.ext.toLowerCase().replace('.', '');
                    if (['json', 'csv', 'tsv', 'md'].includes(ext)) {
                        outputFormat = ext;
                        // Logic: "If user provides output ending in .json, assume user wants raw output... handled without spec of format"
                        formats.add(ext);
                    }
                }

                // If --dir is NOT set, use parent dir of output file
                // logic: "Any additional formats should use the same directory as the --output file specified"
                if (!args.directory) {
                    targetDir = parsed.dir;
                }

                outputBase = parsed.name; // filename without extension
            }
        }
    }

    // 2. Override Directory if --dir/--directory is set
    if (args.directory) {
        // "This directory path will supercede ALL other automatic handling"
        targetDir = path.resolve(cwd, args.directory);
    }

    // 3. Determine Final Filename
    if (outputBase) {
        baseFilename = outputBase;
    }

    // 4. Apply Prefix
    if (args.prefix) {
        baseFilename = `${args.prefix}${baseFilename}`;
    }

    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // 5. Default Format Logic?
    // cliArgs default is ['md']. 
    // If user did `node bench ... --output file.json` and DID NOT specify -f csv, 
    // args.formats might still contain 'md' if I didn't clear it in cliArgs.
    // In cliArgs I cleared it ONLY if user provided -f.
    // If format is default 'md', but user specified output.json...
    // The user said: "This case [output.json] should be handled without any specification of --format... although we should allow... redundantly"
    // And "If the user provides a valid filepath ... which ends in 'json', ... assume the user would like a report generated in that file format."
    // It doesn't explicitly say "AND DON'T GENERATE MD".
    // But usually `--output file.json` implies ONLY json unless `-f md` is added.
    // I should probably clean up specific defaults. 
    // If outputFormat is detected, and formats contains ONLY default 'md' (how to know it's default?), maybe replace?
    // Actually, cliArgs sets default. I can't distinguish default from explicit 'md' easily unless I change cliArgs.
    // Or I assume if outputFormat is set, we ensure it's in the listCorpora.
    // Let's just ensure it's added. If 'md' is there, we generate md too (consistent with "filenames of any additional specified formats").

    return {
        dir: targetDir,
        baseFilename: baseFilename,
        formats: Array.from(formats),
        isAppend: args.isAppend,
        noHeader: args.noHeader
    };
}

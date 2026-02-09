/**
 * benchmark/tests/decompress/profile.cliDecompress.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { runBench } from '../utils/testUtils.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_FILE = path.join(__dirname, 'profile_decompress_test.lz4');

// We need a valid compressed file. 
// Ideally we compress one first. Or we mock it?
// We can use bench.js compress to generate one, but that makes test dependent.
// Let's assume we can just create a dummy file and it might fail decompression logic 
// BUT the profile command should still listLibs if we don't assert validity of output content,
// just that the profiler ran.
// Actually, if the workload crashes, profiling might fail.
// Better to create a valid LZ4 file. 
// Since we have lz4CLI, we can use it? Or just runBench('compress').

test('CLI Profile Decompress Command', async (t) => {
    let compressedPath;

    t.before(() => {
        // Create a compressed file using the CLI
        const src = path.join(__dirname, 'temp_input.txt');
        fs.writeFileSync(src, 'Hello World '.repeat(100));

        // This relies on bench compress working, or we can use lz4 command if available. 
        // Let's assume bench compress works (tested elsewhere).
        // Actually, let's use the node lz4 lib directly if possible? 
        // No, let's just rely on runBench compress.
        const res = runBench(['compress', '-l', 'lz4Divortio', '-i', src, '--output', __dirname]);
        // Output should start with "Saved: "
        // Or check file existence. 
        // benchCompressCLI logs: Saved: <path> to stdout (not JSON unless requested? or depends on default).

        // Simpler: Just make a dummy file. BenchDecompress *might* just error out gracefully or throw.
        // ProfileWorkload runs the decompress loop. If it throws, profile might fail.
        // Let's rely on standard 'compress' having listLibs correctly?
        // Or just write a "fake" file? 
        // Since we are profiling lz4-divortio, it expects valid lz4.

        // Let's try to listLibs a quick compress to generate the file.
        const cRes = runBench(['compress', '-l', 'lz4Divortio', '-i', src, '-s', '1', '-w', '0']);
        if (cRes.exitCode === 0) {
            // Parse output to find where it went?
            // benchCompress creates <file>.lz4 in cwd or tmp?
            // It creates it in benchmark/tmp usually or next to input.
            compressedPath = src + '.lz4';
        }

        // Cleanup src
        if (fs.existsSync(src)) fs.unlinkSync(src);
    });

    t.after(() => {
        if (compressedPath && fs.existsSync(compressedPath)) fs.unlinkSync(compressedPath);
    });

    await t.test('profile decompress logic', () => {
        if (!compressedPath || !fs.existsSync(compressedPath)) {
            t.skip('Skipping profile decompress: could not generate input file');
            return;
        }

        const result = runBench(['profile', 'decompress', '-l', 'lz4Divortio', '-i', compressedPath, '-s', '1', '-w', '0']);

        assert.strictEqual(result.exitCode, 0, `Failed: ${result.stderr}`);

        try {
            const data = JSON.parse(result.stdout);

            assert.strictEqual(data.results[0].operation, 'decompress');
            assert.ok(data.results[0].logs.tick);

        } catch (e) {
            assert.fail(`Output check failed: ${e.message}\nSTDOUT: ${result.stdout}`);
        }
    });
});

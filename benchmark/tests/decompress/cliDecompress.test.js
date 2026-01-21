/**
 * benchmark/tests/decompress/cliDecompress.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { runBench, TEST_CACHE_DIR } from '../utils/testUtils.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_FILE = path.join(__dirname, 'test_input.txt');

test('CLI Decompress Command', async (t) => {

    t.before(() => {
        fs.writeFileSync(TEMP_FILE, 'Hello World '.repeat(100));
    });

    t.after(() => {
        if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    });

    await t.test('decompress local file', () => {
        // Note: decompress benchmark usually implies file is already compressed or it compresses then decompresses?
        // BenchDecompressFilesCLI uses BenchDecompressFilesInProc.
        // BenchDecompressFilesInProc logic: it pre-compresses the input file in memory.

        const outputDir = path.join(TEST_CACHE_DIR, 'decompress');
        fs.mkdirSync(outputDir, { recursive: true });

        const result = runBench(['decompress', '-l', 'lz4Divortio', '-i', TEMP_FILE, '-s', '1', '-w', '0', '-f', 'json', '--dir', outputDir]);
        assert.strictEqual(result.exitCode, 0, `Failed: ${result.stderr}`);

        // files are in outputDir now
        const files = fs.readdirSync(outputDir);
        const jsonFile = files.find(f => f.startsWith('decp_') && f.endsWith('.json'));

        assert.ok(jsonFile, 'Should generate a JSON report file');

        const jsonPath = path.join(outputDir, jsonFile);

        try {
            const content = fs.readFileSync(jsonPath, 'utf8');
            const data = JSON.parse(content);
            assert.ok(data.results, 'Output should contain results');
            // Basic validation
            assert.ok(data.config);

            // Cleanup
            fs.rmSync(outputDir, { recursive: true, force: true });
        } catch (e) {
            assert.fail(`Output was not valid JSON file: ${e.message}`);
        }
    });
});

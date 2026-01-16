/**
 * benchmark/tests/compress/cliCompress.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { runBench } from '../utils/testUtils.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_FILE = path.join(__dirname, 'test_input.txt');

test('CLI Compress Command', async (t) => {

    t.before(() => {
        fs.writeFileSync(TEMP_FILE, 'Hello World '.repeat(100));
    });

    t.after(() => {
        if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    });

    await t.test('compress local file', () => {
        const result = runBench(['compress', '-l', 'lz4Divortio', '-i', TEMP_FILE, '-s', '1', '-w', '0']);
        assert.strictEqual(result.exitCode, 0, `Failed: ${result.stderr}`);

        // Check output JSON structure (default is JSON-like string if not --json?) 
        // Wait, benchCompressFilesCLI.js logs JSON.stringify(output)
        // Let's parse it
        try {
            const data = JSON.parse(result.stdout);
            assert.ok(data[TEMP_FILE], 'Output should contain file key');
            assert.ok(data[TEMP_FILE]['lz4Divortio'], 'Output should contain lib key');
        } catch (e) {
            assert.fail(`Output was not valid JSON: ${result.stdout}`);
        }
    });
});

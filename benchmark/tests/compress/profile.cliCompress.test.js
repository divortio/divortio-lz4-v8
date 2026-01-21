/**
 * benchmark/tests/compress/profile.cliCompress.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { runBench, TEST_CACHE_DIR } from '../utils/testUtils.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_FILE = path.join(TEST_CACHE_DIR, 'profile_compress_test.txt');

test('CLI Profile Compress Command', async (t) => {

    t.before(() => {
        fs.writeFileSync(TEMP_FILE, 'Hello World '.repeat(100));
    });

    t.after(() => {
        if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    });

    await t.test('profile compress logic', () => {
        // Note: using -s 1 -w 0 to keep it fast
        const result = runBench(['profile', 'compress', '-l', 'lz4Divortio', '-i', TEMP_FILE, '-s', '1', '-w', '0']);

        if (result.exitCode !== 0) {
            console.error(result.stderr);
        }
        assert.strictEqual(result.exitCode, 0, `Failed: ${result.stderr}`);

        try {
            const data = JSON.parse(result.stdout);

            // Validate Structure
            assert.ok(data.meta, 'Should have meta');
            assert.ok(data.meta.duration !== undefined, 'Should have duration');

            assert.ok(data.config, 'Should have config');
            assert.strictEqual(data.config.library.name, 'lz4-divortio'); // Normalized name

            assert.ok(data.results, 'Should have results');
            assert.ok(Array.isArray(data.results), 'Results should be array');
            assert.strictEqual(data.results.length, 1);

            const res = data.results[0];
            assert.strictEqual(res.operation, 'compress');
            assert.ok(res.logs.tick, 'Should have tick log path');
            assert.ok(res.logs.processed, 'Should have processed log path');

        } catch (e) {
            assert.fail(`Output check failed: ${e.message}\nSTDOUT: ${result.stdout}`);
        }
    });
});

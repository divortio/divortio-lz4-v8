/**
 * benchmark/tests/roundtrip/profile.cliRoundtrip.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { runBench, TEST_CACHE_DIR } from '../utils/testUtils.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_FILE = path.join(TEST_CACHE_DIR, 'profile_roundtrip_test.txt');

test('CLI Profile Roundtrip Command', async (t) => {

    t.before(() => {
        fs.writeFileSync(TEMP_FILE, 'Hello World '.repeat(100));
    });

    t.after(() => {
        if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    });

    await t.test('profile roundtrip logic', () => {
        const result = runBench(['profile', 'roundtrip', '-l', 'lz4Divortio', '-i', TEMP_FILE, '-s', '1', '-w', '0']);

        if (result.exitCode !== 0) {
            fs.writeFileSync(path.join(__dirname, 'debug_roundtrip_stderr.txt'), result.stderr);
        }
        assert.strictEqual(result.exitCode, 0, `Failed: ${result.stderr}`);

        try {
            const data = JSON.parse(result.stdout);
            fs.writeFileSync(path.join(__dirname, 'debug_roundtrip_output.json'), JSON.stringify(data, null, 2));
            console.error('DEBUG JSON written to file');

            assert.strictEqual(data.results[0].operation, 'roundtrip');
            assert.ok(data.results[0].logs.tick);

        } catch (e) {
            fs.writeFileSync(path.join(__dirname, 'debug_roundtrip_stdout.txt'), result.stdout);
            assert.fail(`Output check failed: ${e.message}`);
        }
    });
});

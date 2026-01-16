/**
 * benchmark/tests/roundtrip/cliRoundtrip.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { runBench } from '../utils/testUtils.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_FILE = path.join(__dirname, 'test_input.txt');

test('CLI Roundtrip Command', async (t) => {

    t.before(() => {
        fs.writeFileSync(TEMP_FILE, 'Hello World '.repeat(100));
    });

    t.after(() => {
        if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
    });

    await t.test('roundtrip local file', () => {
        const result = runBench(['roundtrip', '-l', 'lz4Divortio', '-i', TEMP_FILE, '-s', '1', '-w', '0']);
        assert.strictEqual(result.exitCode, 0, `Failed: ${result.stderr}`);

        try {
            const data = JSON.parse(result.stdout);
            assert.ok(data[TEMP_FILE]);
            assert.ok(data[TEMP_FILE]['lz4Divortio']);
        } catch (e) {
            assert.fail(`Output was not valid JSON: ${result.stdout}`);
        }
    });
});

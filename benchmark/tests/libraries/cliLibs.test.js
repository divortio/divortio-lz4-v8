/**
 * benchmark/tests/libraries/cliLibs.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { runBench } from '../utils/testUtils.js';

test('CLI Libraries Command', async (t) => {

    await t.test('list shows available libraries', () => {
        const result = runBench(['libs']);
        assert.strictEqual(result.exitCode, 0);

        // Check for known libs
        assert.match(result.stdout, /lz4/i);
        assert.match(result.stdout, /lz4-js/i);
        // lz4Divortio usage check
        assert.match(result.stdout, /lz4Divortio/);
    });
});

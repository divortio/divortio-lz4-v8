/**
 * benchmark/tests/errors/profile.errors.test.js
 * 
 * Verifies profile-specific error conditions.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { runBench } from '../utils/testUtils.js';

test('CLI Profile Errors', async (t) => {

    await t.test('missing subcommand', () => {
        const result = runBench(['profile']);
        assert.notStrictEqual(result.exitCode, 0);
        assert.match(result.stderr, /Profile requires a subcommand/i);
    });

    await t.test('invalid subcommand', () => {
        const result = runBench(['profile', 'invalid-sub']);
        assert.notStrictEqual(result.exitCode, 0);
        assert.match(result.stderr, /Unknown profile subcommand/i);
    });

    await t.test('missing arguments (lib)', () => {
        const result = runBench(['profile', 'compress']);
        assert.notStrictEqual(result.exitCode, 0);
        // Config validation should fail
        assert.match(result.stderr, /Profile Error:/i);
    });

    await t.test('multiple libraries not allowed', () => {
        const result = runBench(['profile', 'compress', '-l', 'lz4Divortio', '-l', 'lz4-js', '-i', 'foo']);
        assert.notStrictEqual(result.exitCode, 0);
        // ProfileConfig: "Profile command requires exactly one library"
        assert.match(result.stderr, /requires exactly one library/i);
    });
});

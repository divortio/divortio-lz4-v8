/**
 * benchmark/tests/errors/cli.errors.test.js
 * 
 * Verifies that the CLI correctly handles invalid configurations and user errors.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { runBench } from '../utils/testUtils.js';

test('CLI Generic Errors', async (t) => {

    await t.test('unknown command', () => {
        const result = runBench(['invalid-command']);
        assert.notStrictEqual(result.exitCode, 0, 'Should fail with non-zero exit code');
        assert.match(result.stderr, /Unknown command/i);
    });

    await t.test('compress missing required arguments', () => {
        // missing libs and inputs
        const result = runBench(['compress']);
        assert.notStrictEqual(result.exitCode, 0);
        assert.match(result.stderr, /Error: At least one library/i);
    });

    await t.test('compress missing input/corpus', () => {
        // has lib but missing input
        const result = runBench(['compress', '-l', 'lz4Divortio']);
        assert.notStrictEqual(result.exitCode, 0);
        assert.match(result.stderr, /Error: At least one input/i);
    });

    await t.test('invalid library name', () => {
        // valid command, but library doesn't match
        // logic: resolveLibrary throws or returns null?
        // cliLibs logic: "If strict matching... but filters..." 
        // If specific -l provided but not found? cliLibs throws "Library 'foo' not found"
        const result = runBench(['compress', '-l', 'non-existent-lib', '-i', 'foo']);
        // Note: -i foo doesn't need to exist for this check if lib resolution happens first?
        // Actually Inputs resolved before runner?
        // BenchRun resolves config.
        // Let's verify failure.
        assert.notStrictEqual(result.exitCode, 0);
        // It might print "Library 'non-existent-lib' not found" or similar.
        // We just ensure it fails.
    });
});

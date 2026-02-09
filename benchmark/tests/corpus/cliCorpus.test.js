/**
 * benchmark/tests/corpus/cliCorpus.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { runBench } from '../utils/testUtils.js';

test('CLI Corpus Command', async (t) => {
    
    await t.test('listCorpora shows available corpora', () => {
        const result = runBench(['corpus']);
        assert.strictEqual(result.exitCode, 0, 'Exit code should be 0');
        assert.match(result.stdout, /Corpus: silesia/i);
        assert.match(result.stdout, /Corpus: lz_flex/i);
    });

    await t.test('build silesia (idempotent)', () => {
        // Assuming it might already be cached or not.
        // We verify command runs successfully.
        const result = runBench(['build', '-c', 'silesia']);
        assert.strictEqual(result.exitCode, 0);
        // Output might say "Successfully cached" or "already exists"
        assert.ok(
            result.stdout.includes('Successfully cached') || 
            result.stdout.includes('already exists'),
            'Should report success or existence'
        );
    });
});

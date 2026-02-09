
import { test } from 'node:test';
import assert from 'node:assert';
import { parseArgs } from '../../src/cli/cliArgs.js';
import { CLIConfig } from '../../src/cli/cliConfig.js';

test('cliArgs: Defaults', (t) => {
    const config = parseArgs([]);
    assert.strictEqual(config.command, 'compress');
    assert.strictEqual(config.output, null);
    // CLIConfig likely provides default block size
    // assert.strictEqual(config.blockSize, 4194304); 
});

test('cliArgs: Decompress Command', (t) => {
    const config = parseArgs(['decompress', 'input.lz4', '-o', 'output.txt']);
    assert.strictEqual(config.command, 'decompress');
    assert.strictEqual(config.input, 'input.lz4');
    assert.strictEqual(config.output, 'output.txt');
});

test('cliArgs: Block Size Parsing', (t) => {
    const config = parseArgs(['-B', '64k', 'input.txt']);
    assert.strictEqual(config.blockSize, 65536);

    const config2 = parseArgs(['-B', '4MB', 'input.txt']);
    assert.strictEqual(config2.blockSize, 4194304);
});

test('cliArgs: Flags', (t) => {
    const config = parseArgs(['--verbose', '--force', '--json']);
    assert.strictEqual(config.verbose, true);
    assert.strictEqual(config.force, true);
    assert.strictEqual(config.json, true);
});

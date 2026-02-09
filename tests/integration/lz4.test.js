
import { test } from 'node:test';
import assert from 'node:assert';
import LZ4 from '../../src/lz4.js';

test('LZ4: Entry Point Exports', (t) => {
    assert.ok(LZ4.compress, 'Should export compress');
    assert.ok(LZ4.decompress, 'Should export decompress');
    assert.ok(LZ4.compressRaw, 'Should export compressRaw');
});

test('LZ4: Integration Round Trip', (t) => {
    const data = Buffer.from("Integration Test Data " + Date.now());
    const c = LZ4.compress(data);
    const d = LZ4.decompress(c);
    assert.deepStrictEqual(Buffer.from(d), data);
});


import { test } from 'node:test';
import assert from 'node:assert';
import { compressBuffer } from '../../src/buffer/bufferCompress.js';
import { LZ4 } from '../../src/lz4.js';

test('bufferCompress: Basic', (t) => {
    const input = Buffer.from("Hello World ".repeat(100));
    const compressed = compressBuffer(input);

    // Check Magic Number
    assert.strictEqual(compressed[0], 0x04);
    assert.strictEqual(compressed[1], 0x22);
    assert.strictEqual(compressed[2], 0x4D);
    assert.strictEqual(compressed[3], 0x18);

    assert.ok(compressed.length < input.length);
});

test('lz4: wrapper API', (t) => {
    const input = Buffer.from("TEST");
    const compressed = LZ4.compress(input);
    const decoded = LZ4.decompress(compressed);
    assert.deepStrictEqual(Buffer.from(decoded), input);
});

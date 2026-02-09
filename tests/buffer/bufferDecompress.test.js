
import { test } from 'node:test';
import assert from 'node:assert';
import { decompressBuffer } from '../../src/buffer/bufferDecompress.js';
import { compressBuffer } from '../../src/buffer/bufferCompress.js';

test('bufferDecompress: Basic', (t) => {
    const input = Buffer.from("Decompress Me ".repeat(50));
    const compressed = compressBuffer(input);
    const decompressed = decompressBuffer(compressed);

    assert.deepStrictEqual(Buffer.from(decompressed), input);
});

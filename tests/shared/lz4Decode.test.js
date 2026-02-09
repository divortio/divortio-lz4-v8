
import { test } from 'node:test';
import assert from 'node:assert';
import { LZ4Decoder } from '../../src/shared/lz4Decode.js';
import { LZ4Encoder } from '../../src/shared/lz4Encode.js';

test('LZ4Decoder: Basic Decoding', (t) => {
    const encoder = new LZ4Encoder();
    const input = Buffer.from("Test Data");
    const blocks = encoder.add(input);
    const tail = encoder.finish();
    const compressed = Buffer.concat([...blocks, ...tail]);

    const decoder = new LZ4Decoder();
    const decodedChunks = decoder.update(compressed);
    const result = Buffer.concat(decodedChunks);

    assert.strictEqual(result.toString(), input.toString());
});

test('LZ4Decoder: Split Frames', (t) => {
    const encoder = new LZ4Encoder();
    const input = Buffer.from("A".repeat(100));
    const blocks = encoder.add(input);
    const tail = encoder.finish();
    const compressed = Buffer.concat([...blocks, ...tail]);

    const decoder = new LZ4Decoder();
    const resultChunks = [];

    // Feed byte by byte to stress state machine
    for (let i = 0; i < compressed.length; i++) {
        const chunk = compressed.subarray(i, i + 1);
        const res = decoder.update(chunk);
        resultChunks.push(...res);
    }

    const result = Buffer.concat(resultChunks);
    assert.strictEqual(result.toString(), input.toString());
});

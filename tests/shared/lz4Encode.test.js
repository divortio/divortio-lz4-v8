
import { test } from 'node:test';
import assert from 'node:assert';
import { LZ4Encoder } from '../../src/shared/lz4Encode.js';
import { LZ4Decoder } from '../../src/shared/lz4Decode.js';

test('LZ4Encoder: Basic Streaming', (t) => {
    const encoder = new LZ4Encoder();
    const decoder = new LZ4Decoder();

    const input = Buffer.from("Hello World ".repeat(10));
    const chunks = encoder.add(input);
    const tail = encoder.finish();
    const compressed = Buffer.concat([...chunks, ...tail]);

    const decodedChunks = decoder.update(compressed);
    const decoded = Buffer.concat(decodedChunks);

    assert.strictEqual(decoded.toString(), input.toString());
});

test('LZ4Encoder: External Dictionary Support', async (t) => {

    await t.test('Should compress using external dictionary matches (Zero Copy)', () => {
        const dictStr = "The quick brown fox jumps over the lazy dog. ".repeat(10);
        const dict = Buffer.from(dictStr);
        const input = Buffer.from("The quick brown fox jumps over the lazy dog. ");

        const encoder = new LZ4Encoder(undefined, false, false, false, dict);
        const chunks = encoder.add(input);
        const tail = encoder.finish();
        const compressed = Buffer.concat([...chunks, ...tail]);

        assert.ok(compressed.length < input.length, `Compression failed: ${compressed.length} >= ${input.length}`);
    });

    await t.test('Should correctly decompress stream with external dictionary', () => {
        const dictStr = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
        const dict = Buffer.from(dictStr);

        const inputStr1 = "Lorem ipsum dolor sit amet";
        const inputStr2 = " - NEW DATA - ";
        const inputStr3 = "consectetur adipiscing elit.";

        const encoder = new LZ4Encoder(undefined, false, false, false, dict);
        const c1 = encoder.add(Buffer.from(inputStr1));
        const c2 = encoder.add(Buffer.from(inputStr2));
        const c3 = encoder.add(Buffer.from(inputStr3));
        const tail = encoder.finish();

        const compressed = Buffer.concat([...c1, ...c2, ...c3, ...tail]);

        const decoder = new LZ4Decoder(dict);
        const decodedChunks = decoder.update(compressed);
        const decoded = Buffer.concat(decodedChunks);

        const expected = Buffer.from(inputStr1 + inputStr2 + inputStr3);
        assert.strictEqual(decoded.toString(), expected.toString());
    });

    await t.test('Should handle Sliding Window with Ring Buffer (Stress)', async () => {
        const size = 256 * 1024;
        const input = Buffer.alloc(size);
        for (let i = 0; i < size; i++) input[i] = (i % 256);

        // blockId 4 = 64KB
        const encoder = new LZ4Encoder(65536);

        const chunkSize = 17 * 1024;
        let offset = 0;
        const chunks = [];

        while (offset < size) {
            const end = Math.min(offset + chunkSize, size);
            const chunk = input.subarray(offset, end);
            chunks.push(...encoder.add(chunk));
            offset = end;
        }
        chunks.push(...encoder.finish());

        const compressed = Buffer.concat(chunks);

        const decoder = new LZ4Decoder();
        const decodedChunks = decoder.update(compressed);
        const decoded = Buffer.concat(decodedChunks);

        assert.strictEqual(decoded.length, input.length, 'Decoded length mismatch');
        assert.ok(decoded.equals(input), 'Decoded content mismatch');
    });
});

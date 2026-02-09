
import { test } from 'node:test';
import assert from 'node:assert';
import { createCompressStream } from '../../src/stream/streamCompress.js';
import { createDecompressStream } from '../../src/stream/streamDecompress.js';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

test('streamCompress: Node.js Streams', async (t) => {
    const source = Readable.from(["Chunk1 ", "Chunk2 ", "Chunk3"]);
    const compressStream = createCompressStream();
    const decompressStream = createDecompressStream();

    // Pipeline: Source -> Compress -> Decompress -> Validate
    // Pipeline: Source -> Compress -> Decompress -> Collect
    // Note: createCompressStream/createDecompressStream return Web Streams (TransformStream).
    // Node.js pipeline can handle them, but destination must be a writable or async generator.

    // We can just pipe manually or use iteration if Node version supports it.
    // Iterating a Web Stream:
    const reader = decompressStream.readable.getReader();
    const chunks = [];

    // Connect pipelines:
    // Source (Node Readable) -> toWeb? Or just feed.
    // Simplifying: write to compressStream writer manually.

    const writer = compressStream.writable.getWriter();
    const inputChunks = ["Chunk1 ", "Chunk2 ", "Chunk3"];

    (async () => {
        for (const c of inputChunks) {
            await writer.write(Buffer.from(c));
        }
        await writer.close();
    })();

    // Pipe compress readable to decompress writable
    compressStream.readable.pipeTo(decompressStream.writable);

    // Read output
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    const result = Buffer.concat(chunks).toString();
    assert.strictEqual(result, "Chunk1 Chunk2 Chunk3");
});

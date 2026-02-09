
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runStream as compressStream } from '../../src/cli/cliCompress.js';
import { runStream as decompressStream } from '../../src/cli/cliDecompress.js';
import { LZ4 } from '../../src/lz4.js';

// Setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tmpDir = path.join(__dirname, 'tmp_stream_test');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

test('CLI: Stream Compression & Decompression Round Trip', async (t) => {
    const inputFile = path.join(tmpDir, 'stream_test.bin');
    const compressedFile = path.join(tmpDir, 'stream_test.bin.lz4');
    const decompressedFile = path.join(tmpDir, 'stream_test.out.bin');

    // 1. Generate Data (Buffer-based generation, but file I/O will be stream)
    const dataSize = 1024 * 1024; // 1MB
    const data = new Uint8Array(dataSize);
    for (let i = 0; i < dataSize; i++) data[i] = i % 256;
    fs.writeFileSync(inputFile, data);

    // 2. Compress Stream
    const compressConfig = {
        input: inputFile,
        output: compressedFile,
        force: true,
        keep: true, // Don't delete input
        blockSize: 65536,
        blockIndependence: false,
        contentChecksum: true,
        blockChecksum: false,
        addContentSize: true,
        verbose: false,
        log: false
    };

    await compressStream(compressConfig);

    assert.ok(fs.existsSync(compressedFile), 'Compressed file should exist');
    const compressedSize = fs.statSync(compressedFile).size;
    assert.ok(compressedSize > 0, 'Compressed file should not be empty');
    // Basic ratio check (it's compressible data)
    assert.ok(compressedSize < dataSize, 'Compression should reduce size');

    // 3. Decompress Stream
    const decompressConfig = {
        input: compressedFile,
        output: decompressedFile,
        force: true,
        keep: true,
        verifyChecksum: true,
        verbose: false,
        log: false
    };

    await decompressStream(decompressConfig);

    assert.ok(fs.existsSync(decompressedFile), 'Decompressed file should exist');

    // 4. Verify Content
    const outputData = fs.readFileSync(decompressedFile);
    assert.strictEqual(outputData.length, dataSize, 'Output size mismatch');
    assert.ok(Buffer.compare(data, outputData) === 0, 'Content mismatch after round trip');

    // Cleanup
    fs.rmSync(inputFile, { force: true });
    fs.rmSync(compressedFile, { force: true });
    fs.rmSync(decompressedFile, { force: true });
});

test('CLI: Stream Decompression of Legacy/Buffer Compressed File', async (t) => {
    // Tests that stream decompress can read a file created by buffer compress (standard LZ4)
    const inputFile = path.join(tmpDir, 'legacy_test.bin');
    const compressedFile = path.join(tmpDir, 'legacy_test.lz4');
    const decompressedFile = path.join(tmpDir, 'legacy_test.out');

    const data = Buffer.from("Buffer generated data");
    fs.writeFileSync(inputFile, data);

    // Compress using standard LZ4 (buffer) - simulating "external" file
    const compressed = LZ4.compress(data);
    fs.writeFileSync(compressedFile, compressed);

    // Decompress using Stream CLI
    const decompressConfig = {
        input: compressedFile,
        output: decompressedFile,
        force: true,
        keep: true,
        verbose: false
    };

    await decompressStream(decompressConfig);

    const output = fs.readFileSync(decompressedFile);
    assert.deepStrictEqual(output, data);

    // Cleanup
    fs.rmSync(inputFile, { force: true });
    fs.rmSync(compressedFile, { force: true });
    fs.rmSync(decompressedFile, { force: true });
});

// Teardown
test.after(() => {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
});

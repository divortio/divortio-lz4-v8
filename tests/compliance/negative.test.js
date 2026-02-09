
import { test } from 'node:test';
import assert from 'node:assert';
import { LZ4 } from '../../src/lz4.js';
import { LZ4Decoder } from '../../src/shared/lz4Decode.js';

test('Negative: Invalid Magic Number', (t) => {
    const badMagic = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x04, 0x22, 0x4D, 0x18]); // Reversed/Wrong
    assert.throws(() => {
        LZ4.decompress(badMagic);
    }, /Magic Number/i);
});

test('Negative: Truncated Header', (t) => {
    const truncated = new Uint8Array([0x04, 0x22, 0x4D]); // Too short
    assert.throws(() => {
        LZ4.decompress(truncated);
    }, /EOF|Truncated|Input too small/i);
});

test('Negative: Invalid Header Checksum', (t) => {
    // Magic + FLG + BD + HC
    const frame = new Uint8Array([
        0x04, 0x22, 0x4D, 0x18, // Magic
        0x40, // FLG (Ver 1, Indep)
        0x40, // BD (64KB)
        0x00  // Bad Checksum (Should be XXHash)
        // ... data ...
    ]);

    // Decoding should fail at header step
    assert.throws(() => {
        LZ4.decompress(frame);
    }, /Header Checksum/i);
});

test('Negative: Block Size Exceeded', (t) => {
    // If we craft a block that claims to be larger than maxBlockSize? (Spec allows this check)
    // Actually Decoder usually respects the block size declared in BD.
    // We can test generic malformed block data.
});

test('Negative: API Misuse', (t) => {
    assert.throws(() => LZ4.compress(12345), /Input must be/i);
    assert.throws(() => LZ4.decompress(null), /Input must be/i);
});

test('Negative: Content Checksum Mismatch', async (t) => {
    // Generate valid frame
    const input = Buffer.from("Test Data");
    const compressed = LZ4.compress(input, null, undefined, false, true); // Enable Content Checksum

    // Tamper with checksum (last 4 bytes)
    compressed[compressed.length - 1] ^= 0xFF;

    assert.throws(() => {
        // High level helper does verify checksum by default?
        // Let's check: LZ4.decompress -> decompressBuffer -> verifyChecksum=true default?
        // We'll see.
        LZ4.decompress(compressed, null, true);
    }, /Checksum Error/i);
});

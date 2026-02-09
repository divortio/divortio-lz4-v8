
import { test } from 'node:test';
import assert from 'node:assert';
import { LZ4 } from '../../src/lz4.js';

/**
 * Regression tests ported from lz4_flex (Rust)
 * Source: reference/PSeitz/lz4_flex/tests/tests.rs
 */

test('Reference (Rust): bug_fuzz', (t) => {
    const data = new Uint8Array([
        8, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 0, 0, 8, 0, 138,
    ]);
    // These fuzz tests in Rust seem to be "test_roundtrip", meaning they expect this data to be VALD uncompressed data?
    // Wait, let's re-read tests.rs.
    // fn test_roundtrip(bytes: impl AsRef<[u8]>) { ... compress ... decompress ... assert_eq ... }
    // Ah! The `data` in bug_fuzz is passed to `test_roundtrip`.
    // So `data` is the RAW INPUT (Uncompressed).
    // The test ensures that this specific pattern of raw bytes handles round-trip correctly.

    verifyRoundTrip(data);
});

test('Reference (Rust): bug_fuzz_2', (t) => {
    const data = new Uint8Array([
        122, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 65, 0, 0, 128, 10, 1, 10, 1, 0, 122,
    ]);
    verifyRoundTrip(data);
});

test('Reference (Rust): bug_fuzz_3', (t) => {
    const data = new Uint8Array([
        36, 16, 0, 0, 79, 177, 176, 176, 171, 1, 0, 255, 207, 79, 79, 79, 79, 79, 1, 1, 49, 0, 16,
        0, 79, 79, 79, 79, 79, 1, 0, 255, 36, 79, 79, 79, 79, 79, 1, 0, 255, 207, 79, 79, 79, 79,
        79, 1, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 8, 207, 1, 207, 207, 79, 199,
        79, 79, 40, 79, 1, 1, 1, 1, 1, 1, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 79, 15, 15, 14, 15, 15, 15, 15, 15, 15,
        15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 61, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 0,
        48, 45, 0, 1, 0, 0, 1, 0,
    ]);
    verifyRoundTrip(data);
});

test('Reference (Rust): bug_fuzz_4', (t) => {
    const data = new Uint8Array([147]);
    verifyRoundTrip(data);
});

test('Reference (Rust): bug_fuzz_5', (t) => {
    const data = new Uint8Array([
        255, 255, 255, 255, 253, 235, 156, 140, 8, 0, 140, 45, 169, 0, 27, 128, 48, 0, 140, 0, 0,
        255, 255, 255, 253, 235, 156, 140, 8, 61, 255, 255, 255, 255, 65, 239, 254,
    ]);
    verifyRoundTrip(data);
});

test('Reference (Rust): bug_fuzz_6', (t) => {
    const data = new Uint8Array([
        181, 181, 181, 181, 181, 147, 147, 147, 0, 0, 255, 218, 44, 0, 177, 44, 0, 233, 177, 74,
        85, 47, 95, 146, 189, 177, 1, 0, 255, 2, 109, 180, 255, 255, 0, 0, 0, 181, 181, 181, 147,
        147, 147, 0, 0, 255, 218, 146, 146, 181, 0, 0, 181,
    ]);
    verifyRoundTrip(data);
});

test('Reference (Rust): bug_fuzz_7 (Compressed)', (t) => {
    // This test calls `test_decomp(data)`.
    // In Rust: `fn test_decomp(data: &[u8]) { ... decompress_size_prepended(data) ... }`
    // So this data IS ALREADY COMPRESSED (or malformed compressed data).
    // The test says "should not panic".
    const data = new Uint8Array([
        39, 0, 0, 0, 0, 0, 0, 237, 0, 0, 0, 0, 0, 0, 16, 0, 0, 4, 0, 0, 0, 39, 32, 0, 2, 0, 162, 5,
        36, 0, 0, 0, 0, 7, 0,
    ]);

    try {
        // We use our high-level decompress
        LZ4.decompress(data);
    } catch (e) {
        // It's okay to throw error (invalid input), but NOT crash/panic.
        // The Rust test says "should not panic".
        // In JS "panic" usually means crash the process or infinite loop.
        // Exceptions are fine.
    }
});

test('Reference (Rust): bug_fuzz_8 (Compressed)', (t) => {
    const data = new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 10,
    ]);
    try {
        LZ4.decompress(data);
    } catch (e) {
        // OK
    }
});


// Helper
function verifyRoundTrip(input) {
    const compressed = LZ4.compress(input);
    const decompressed = LZ4.decompress(compressed);
    assert.deepStrictEqual(decompressed, input, `Round trip failed for input length ${input.length}`);
}

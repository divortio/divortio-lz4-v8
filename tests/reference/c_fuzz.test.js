
import { test } from 'node:test';
import assert from 'node:assert';
import { LZ4 } from '../../src/lz4.js';

/**
 * C Reference Fuzz Logic ported from lz4/tests/frametest.c
 */

// --- Constants & Macros ---
const prime1 = 2654435761 >>> 0;
const prime2 = 2246822519 >>> 0;

let randState = { val: 0 };

function FUZ_rotl32(x, r) {
    return ((x << r) | (x >>> (32 - r))) >>> 0;
}

function FUZ_rand(state) {
    let rand32 = state.val >>> 0;
    rand32 = Math.imul(rand32, prime1) >>> 0;
    rand32 = (rand32 + prime2) >>> 0;
    rand32 = FUZ_rotl32(rand32, 13);
    state.val = rand32;
    return (rand32 >>> 5);
}

function RAND_BITS(state, N) {
    return (FUZ_rand(state) & ((1 << N) - 1));
}

function FUZ_LITERAL(state) {
    return (RAND_BITS(state, 6) + 48) & 0xFF; // '0' is 48
}

function FUZ_ABOUT(state, R) {
    return ((FUZ_rand(state) % R) + (FUZ_rand(state) % R) + 1);
}

function MIN(a, b) { return a < b ? a : b; }

function FUZ_fillCompressibleNoiseBuffer(buffer, bufferSize, proba, state) {
    let pos = 0;
    const P32 = Math.floor(32768 * proba);

    // First Byte
    buffer[pos++] = FUZ_LITERAL(state);

    while (pos < bufferSize) {
        // Select : Literal (noise) or copy (within 64K)
        if (RAND_BITS(state, 15) < P32) {
            // Copy (within 64K)
            const lengthRand = FUZ_ABOUT(state, 8) + 4;
            const length = MIN(lengthRand, bufferSize - pos);
            const end = pos + length;
            const offsetRand = RAND_BITS(state, 15) + 1;
            const offset = MIN(offsetRand, pos);
            let match = pos - offset;
            while (pos < end) {
                buffer[pos++] = buffer[match++];
            }
        } else {
            // Literal (noise)
            const lengthRand = FUZ_ABOUT(state, 4);
            const length = MIN(lengthRand, bufferSize - pos);
            const end = pos + length;
            while (pos < end) {
                buffer[pos++] = FUZ_LITERAL(state);
            }
        }
    }
}

test('Reference (C): Compressible Noise Fuzz (50% prob, 2MB)', (t) => {
    const COMPRESSIBLE_NOISE_LENGTH = 2 * 1024 * 1024; // 2MB
    const buffer = new Uint8Array(COMPRESSIBLE_NOISE_LENGTH);
    randState.val = 12345; // Seed

    // Fill with noise (50% compressible probability)
    FUZ_fillCompressibleNoiseBuffer(buffer, COMPRESSIBLE_NOISE_LENGTH, 0.50, randState);

    // Sanity check: ensure data is not all zeros
    let sum = 0;
    for (let i = 0; i < 100; i++) sum += buffer[i];
    assert.ok(sum > 0, "Fuzz buffer should not be empty");

    // Round Trip
    const compressed = LZ4.compress(buffer);
    const decompressed = LZ4.decompress(compressed);

    assert.deepStrictEqual(decompressed, buffer);

    // Check compression ratio
    const ratio = compressed.length / buffer.length;
    // console.log(`Fuzz Compression Ratio: ${(ratio * 100).toFixed(2)}%`);
    assert.ok(ratio < 1.0, `Compression should reduce size (got ${ratio})`);
});

test('Reference (C): Compressible Noise Fuzz (10% prob - Harder)', (t) => {
    // Less compressible
    const COMPRESSIBLE_NOISE_LENGTH = 512 * 1024;
    const buffer = new Uint8Array(COMPRESSIBLE_NOISE_LENGTH);
    randState.val = 67890;

    FUZ_fillCompressibleNoiseBuffer(buffer, COMPRESSIBLE_NOISE_LENGTH, 0.10, randState);

    const compressed = LZ4.compress(buffer);
    const decompressed = LZ4.decompress(compressed);
    assert.deepStrictEqual(decompressed, buffer);
});

test('Reference (C): Compressible Noise Fuzz (90% prob - Easier)', (t) => {
    // Highly compressible
    const COMPRESSIBLE_NOISE_LENGTH = 512 * 1024;
    const buffer = new Uint8Array(COMPRESSIBLE_NOISE_LENGTH);
    randState.val = 99999;

    FUZ_fillCompressibleNoiseBuffer(buffer, COMPRESSIBLE_NOISE_LENGTH, 0.90, randState);

    const compressed = LZ4.compress(buffer);
    const decompressed = LZ4.decompress(compressed);
    assert.deepStrictEqual(decompressed, buffer);
    assert.ok(compressed.length < buffer.length * 0.5, "Should compress well");
});

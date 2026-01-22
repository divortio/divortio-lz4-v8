/**
 * src/block/blockCompress.js
 * * @fileoverview Core LZ4 Block Compression Kernel.
 * This module implements the raw LZ4 block compression algorithm. It is heavily tuned
 * for V8 (Node.js/Chrome) performance, utilizing:
 * - Integer math optimization (`| 0`) to force 32-bit integer execution paths.
 * - Hash table lookups for deduplication.
 * - Inlined Hashing to avoid function call overhead.
 * * @module blockCompress
 */

// Imports removed for Manual Inlining (thy-1a)
// import { encodeLiterals } from "./blockLiterals.js";
// import { encodeMatch } from "./blockMatch.js";

// --- Constants (Localized for V8 Immediates) ---
const LAST_LITERALS = 5 | 0;
const MF_LIMIT = 12 | 0;
const HASH_LOG = 14 | 0;
const HASH_SHIFT = (32 - HASH_LOG) | 0;
const HASH_MULTIPLIER = 2654435761 | 0; // 0x9E3779B1

/**
 * Compresses a single block of data using the LZ4 algorithm.
 * * This low-level function writes compressed sequences directly into the `output` buffer.
 * It does not handle frame headers, checksums, or memory allocation.
 * @param {Uint8Array} src - The source buffer containing the raw input data.
 * @param {Uint8Array} output - The destination buffer for compressed data.
 * @param {number} srcStart - The starting offset in the `src` buffer.
 * @param {number} srcLen - The length of the data to compress in this block.
 * @param {Int32Array} hashTable - A pre-allocated hash table (16k entries) for match finding.
 * @param {number} outputOffset - The starting offset in the `output` buffer to write to.
 * @returns {number} The number of bytes written to the `output` buffer.
 */
export function compressBlock(src, output, srcStart, srcLen, hashTable, outputOffset) {
    // V8 Optimization: Explicitly coerce arguments to 32-bit integers (SMIs)
    var sIndex = srcStart | 0;
    var dIndex = outputOffset | 0;



    // Derived bounds
    var sEnd = (srcStart + srcLen) | 0;
    var mflimit = (sEnd - MF_LIMIT) | 0;
    var matchLimit = (sEnd - LAST_LITERALS) | 0;

    var mAnchor = sIndex;

    // Search Skip state
    var searchMatchCount = (1 << 6) + 3; // Start at 67
    var mStep = 0 | 0;

    // Hot Loop Variables
    var seq = 0 | 0;
    var hash = 0 | 0;
    var mIndex = 0 | 0;

    var litLen = 0 | 0;
    var tokenPos = 0 | 0;

    var sPtr = 0 | 0;
    var mPtr = 0 | 0;
    var matchLen = 0 | 0;
    var offset = 0 | 0;

    // --- Main Compression Loop ---
    // Note: Helper functions (encodeLiterals, encodeMatch) are manually inlined here (thy-1a).
    // This removes call overhead and allows TurboFan to see the entire loop scope for optimization.
    while (sIndex < mflimit) {
        // 1. Read 32-bit Sequence
        // Note: TypedArray access `src[sIndex]` is optimized by V8 if sIndex is SMI.
        seq = (src[sIndex] | (src[sIndex + 1] << 8) | (src[sIndex + 2] << 16) | (src[sIndex + 3] << 24)) | 0;

        // 2. Calculate Hash (Inlined)
        // Math.imul is the only way to get correct 32-bit overflow multiplication in JS.
        // We OR with 0 to ensure the result is treated as signed 32-bit integer immediately.
        hash = (Math.imul(seq, HASH_MULTIPLIER) >>> HASH_SHIFT) | 0;

        // 3. Lookup Match
        // Hash table is Int32Array, access is fast if hash is SMI.
        mIndex = (hashTable[hash] - 1) | 0;

        // 4. Update Hash Table
        // Store current position (+1)
        hashTable[hash] = (sIndex + 1) | 0;

        // 5. Verify Match
        if (mIndex < 0 ||
            sIndex === mIndex ||
            ((sIndex - mIndex) >>> 16) > 0 ||
            (src[mIndex] | (src[mIndex + 1] << 8) | (src[mIndex + 2] << 16) | (src[mIndex + 3] << 24)) !== seq) {

            // No match found
            mStep = (searchMatchCount++ >> 6) | 0;
            sIndex = (sIndex + mStep) | 0;
            continue;
        }

        // Match found: Reset search skip
        searchMatchCount = (1 << 6) + 3;

        // --- Encode Literals (Inlined) ---
        litLen = (sIndex - mAnchor) | 0;
        tokenPos = dIndex++;

        // 1. Write Literal Length
        if (litLen >= 15) {
            output[tokenPos] = 0xF0;
            var l = (litLen - 15) | 0;
            while (l >= 255) {
                output[dIndex++] = 255;
                l = (l - 255) | 0;
            }
            output[dIndex++] = l;
        } else {
            output[tokenPos] = (litLen << 4);
        }

        // 2. Copy Literals (Zero Alloc Loop)
        if (litLen > 0) {
            var litSrc = mAnchor | 0;
            var litEnd = (dIndex + litLen) | 0;
            while (dIndex < litEnd) {
                output[dIndex++] = src[litSrc++];
            }
        }

        // --- Encode Match (Inlined) ---
        sPtr = (sIndex + 4) | 0;
        mPtr = (mIndex + 4) | 0;

        while (sPtr < matchLimit && src[sPtr] === src[mPtr]) {
            sPtr = (sPtr + 1) | 0;
            mPtr = (mPtr + 1) | 0;
        }

        matchLen = (sPtr - sIndex) | 0;
        offset = (sIndex - mIndex) | 0;

        // 1. Write Offset
        output[dIndex++] = offset & 0xff;
        output[dIndex++] = (offset >>> 8) & 0xff;

        // 2. Write Match Length
        var lenCode = (matchLen - 4) | 0;
        if (lenCode >= 15) {
            output[tokenPos] |= 0x0F;
            var l2 = (lenCode - 15) | 0;
            while (l2 >= 255) {
                output[dIndex++] = 255;
                l2 = (l2 - 255) | 0;
            }
            output[dIndex++] = l2;
        } else {
            output[tokenPos] |= lenCode;
        }

        // Advance Anchor
        sIndex = sPtr;
        mAnchor = sPtr;
    }



    // --- Final Literals (Tail) Inlined ---
    var finalLitLen = (sEnd - mAnchor) | 0;
    var tokenPos = dIndex++;

    if (finalLitLen >= 15) {
        output[tokenPos] = 0xF0;
        var lFn = (finalLitLen - 15) | 0;
        while (lFn >= 255) {
            output[dIndex++] = 255;
            lFn = (lFn - 255) | 0;
        }
        output[dIndex++] = lFn;
    } else {
        output[tokenPos] = (finalLitLen << 4);
    }

    // Copy Final
    if (finalLitLen > 0) {
        var litSrcFn = mAnchor | 0;
        var litEndFn = (dIndex + finalLitLen) | 0;
        while (dIndex < litEndFn) {
            output[dIndex++] = src[litSrcFn++];
        }
    }

    return (dIndex - outputOffset) | 0;
}
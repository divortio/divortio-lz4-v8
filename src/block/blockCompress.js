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


// --- Constants (Captured in Closure) ---
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
 * @param {number} [acceleration=1] - Speed vs Ratio trade-off. 1 is default.
 * @returns {number} The number of bytes written to the `output` buffer.
 */
export function compressBlock(src,
                              output,
                              srcStart,
                              srcLen,
                              hashTable,
                              outputOffset,
                              acceleration = 1
) {
    // V8 Optimization: Explicitly coerce arguments to 32-bit integers (SMIs)
    var sIndex = srcStart | 0;
    var dIndex = outputOffset | 0;
    var accel = (acceleration < 1 ? 1 : (acceleration > 65537 ? 65537 : acceleration)) | 0; // Validate & Clamp

    // Derived bounds
    var sEnd = (srcStart + srcLen) | 0;
    var mflimit = (sEnd - MF_LIMIT) | 0;
    var matchLimit = (sEnd - LAST_LITERALS) | 0;

    var mAnchor = sIndex;

    // Search Skip state
    var searchMatchCount = (accel << 6) | 0; // Spec: accel << skipTrigger(6)
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
        searchMatchCount = (accel << 6) | 0;

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
    var finalLitLen = ((sEnd | 0) - (mAnchor | 0)) | 0;
    tokenPos = dIndex++;

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

/**
 * Compresses a block using an External Dictionary (Zero-Copy).
 * * Same as `compressBlock` but handles matches crossing into `dictionary`.
 * * Virtual Address Space: [Dictionary (0..dictLen)] + [Input (dictLen..Total)]
 * @param {Uint8Array} src - The Input Buffer.
 * @param {Uint8Array} output - Destination.
 * @param {number} srcStart - ALWAYS 0 for External Mode (Input starts at 0 relative to itself).
 * @param {number} srcLen - Length of input.
 * @param {Int32Array} hashTable - Hash Table (Populated with Dictionary).
 * @param {number} outputOffset - Start offset in output.
 * @param {Uint8Array} dictionary - The External Dictionary Buffer.
 * @param {number} [acceleration=1] - Speed vs Ratio trade-off.
 */
export function compressBlockExt(src, output, srcStart, srcLen, hashTable, outputOffset, dictionary, acceleration = 1) {
    // V8 Optimization: Explicitly coerce arguments
    var sIndex = srcStart | 0;
    var dIndex = outputOffset | 0;
    var accel = (acceleration < 1 ? 1 : (acceleration > 65537 ? 65537 : acceleration)) | 0;

    // Derived bounds
    var sEnd = (srcLen) | 0;
    var mflimit = (sEnd - MF_LIMIT) | 0;
    var matchLimit = (sEnd - LAST_LITERALS) | 0;

    // External Dictionary Params
    var dictLen = dictionary.length | 0;

    var mAnchor = sIndex;

    // Search Skip state
    var searchMatchCount = (accel << 6) | 0;
    var mStep = 0 | 0;

    // Hot Loop Variables
    var seq = 0 | 0;
    var hash = 0 | 0;
    var mIndex = 0 | 0; // Virtual Match Index

    var litLen = 0 | 0;
    var tokenPos = 0 | 0;

    var sPtr = 0 | 0;
    var mPtr = 0 | 0;
    var matchLen = 0 | 0;
    var offset = 0 | 0;

    while (sIndex < mflimit) {
        // 1. Read 32-bit Sequence
        seq = (src[sIndex] | (src[sIndex + 1] << 8) | (src[sIndex + 2] << 16) | (src[sIndex + 3] << 24)) | 0;

        // 2. Hash
        hash = (Math.imul(seq, HASH_MULTIPLIER) >>> HASH_SHIFT) | 0;

        // 3. Lookup (Virtual Index)
        mIndex = (hashTable[hash] - 1) | 0;

        // 4. Update Hash Table (Virtual Index of Current Pos = sIndex + dictLen)
        hashTable[hash] = (sIndex + dictLen + 1) | 0;

        // 5. Verify Match
        var matchFound = false;

        // Distance Check (Max 64KB)
        if (mIndex >= 0 && ((sIndex + dictLen) - mIndex) < 65536) {
            if (mIndex < dictLen) {
                // Dictionary Match
                if ((dictLen - mIndex) >= 4) {
                    var matchSeq = (dictionary[mIndex] | (dictionary[mIndex + 1] << 8) | (dictionary[mIndex + 2] << 16) | (dictionary[mIndex + 3] << 24)) | 0;
                    if (matchSeq === seq) matchFound = true;
                }
            } else {
                // Input Match
                var realIdx = (mIndex - dictLen) | 0;
                if (src[realIdx] === src[sIndex] && // Byte 0
                    src[realIdx + 1] === src[sIndex + 1] && // Byte 1
                    src[realIdx + 2] === src[sIndex + 2] && // Byte 2
                    src[realIdx + 3] === src[sIndex + 3]) { // Byte 3
                    matchFound = true;
                }
            }
        }

        if (!matchFound) {
            mStep = (searchMatchCount++ >> 6) | 0;
            sIndex = (sIndex + mStep) | 0;
            continue;
        }

        // Match found
        searchMatchCount = (accel << 6) | 0;

        // --- Encode Literals ---
        litLen = (sIndex - mAnchor) | 0;
        tokenPos = dIndex++;

        if (litLen >= 15) {
            output[tokenPos] = 0xF0;
            var l = (litLen - 15) | 0;
            while (l >= 255) { output[dIndex++] = 255; l = (l - 255) | 0; }
            output[dIndex++] = l;
        } else {
            output[tokenPos] = (litLen << 4);
        }

        // Copy Literals
        if (litLen > 0) {
            var litSrc = mAnchor | 0;
            var litEnd = (dIndex + litLen) | 0;
            while (dIndex < litEnd) output[dIndex++] = src[litSrc++];
        }

        // --- Encode Match ---
        sPtr = (sIndex + 4) | 0;

        // Match Extension Logic
        if (mIndex < dictLen) {
            // Dictionary Match
            mPtr = (mIndex + 4) | 0;
            // 1. Extend within Dictionary
            while (sPtr < matchLimit && mPtr < dictLen && src[sPtr] === dictionary[mPtr]) {
                sPtr++; mPtr++;
            }
            // 2. Cross Boundary (Match continues into Input?)
            if (mPtr === dictLen) {
                // Wrap to Input Start
                mPtr = 0; // Input[0] corresponds to Virtual[dictLen]
                while (sPtr < matchLimit && src[sPtr] === src[mPtr]) {
                    sPtr++; mPtr++;
                }
            }
        } else {
            // Internal Match
            mPtr = (mIndex - dictLen + 4) | 0;
            while (sPtr < matchLimit && src[sPtr] === src[mPtr]) {
                sPtr++; mPtr++;
            }
        }

        matchLen = (sPtr - sIndex) | 0;
        offset = ((sIndex + dictLen) - mIndex) | 0;

        // Write Offset
        output[dIndex++] = offset & 0xff;
        output[dIndex++] = (offset >>> 8) & 0xff;

        // Write Match Length
        var lenCode = (matchLen - 4) | 0;
        if (lenCode >= 15) {
            output[tokenPos] |= 0x0F;
            var l2 = (lenCode - 15) | 0;
            while (l2 >= 255) { output[dIndex++] = 255; l2 = (l2 - 255) | 0; }
            output[dIndex++] = l2;
        } else {
            output[tokenPos] |= lenCode;
        }

        sIndex = sPtr;
        mAnchor = sPtr;
    }

    // --- Final Literals ---
    var finalLitLen = ((sEnd | 0) - (mAnchor | 0)) | 0;
    tokenPos = dIndex++;

    if (finalLitLen >= 15) {
        output[tokenPos] = 0xF0;
        var lFn = (finalLitLen - 15) | 0;
        while (lFn >= 255) { output[dIndex++] = 255; lFn = (lFn - 255) | 0; }
        output[dIndex++] = lFn;
    } else {
        output[tokenPos] = (finalLitLen << 4);
    }
    if (finalLitLen > 0) {
        var litSrcFn = mAnchor | 0;
        var litEndFn = (dIndex + finalLitLen) | 0;
        while (dIndex < litEndFn) output[dIndex++] = src[litSrcFn++];
    }

    return (dIndex - outputOffset) | 0;
}
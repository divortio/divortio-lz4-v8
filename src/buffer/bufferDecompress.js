/**
 * src/buffer/bufferDecompress.js
 * * LZ4 Frame Format Decompression.
 * * This module handles the parsing and decompression of full LZ4 Frames. It implements
 * the **Zero-Allocation / Direct Write** strategy when the "Content Size" header is present,
 * allowing it to decompress directly into the final buffer without intermediate chunks.
 * * Features:
 * - **Frame Parsing**: Handles Magic Number, Flags (Version, Block Independence, Checksums), and Descriptors.
 * - **Direct Write Optimization**: If the total size is known, allocates once and writes directly.
 * - **Streaming Support (Fallback)**: If size is unknown, uses a chunked approach with a rolling 64KB window.
 * - **Checksum Verification**: Validates Content Checksum (xxHash32) if enabled.
 * @module bufferDecompress
 */

import { xxHash32 } from '../xxhash32/xxhash32.js';
import { decompressBlock } from '../block/blockDecompress.js';
import { ensureBuffer } from '../shared/lz4Util.js';

// --- Constants ---

/** LZ4 Magic Number (Little Endian). */
const MAGIC_NUMBER = 0x184D2204;

/** Supported LZ4 Version (1). */
const LZ4_VERSION = 1;

// --- Flag Masks ---
const FLG_VERSION_MASK = 0xC0;
const FLG_BLOCK_CHECKSUM_MASK = 0x10;
const FLG_CONTENT_SIZE_MASK = 0x08;
const FLG_CONTENT_CHECKSUM_MASK = 0x04;
const FLG_DICT_ID_MASK = 0x01;

/** Max Block Sizes (mapped from Block Descriptor ID). */
const BLOCK_MAX_SIZES = { 4: 65536, 5: 262144, 6: 1048576, 7: 4194304 };

/** * Shared workspace for chunked decompression.
 * Reused to avoid allocation when the output size is unknown.
 * Size: Dynamic (based on frame BD).
 */
// const FALLBACK_WORKSPACE = new Uint8Array(BLOCK_MAX_SIZES[7]);

/**
 * Decompresses an LZ4 Frame into a Uint8Array.
 * @param {Uint8Array|ArrayBuffer|Buffer} input - The compressed LZ4 frame.
 * @param {Uint8Array} [dictionary=null] - Optional dictionary for pre-warming (used in dependent block streams).
 * @param {boolean} [verifyChecksum=false] - If true, calculates and verifies the Content Checksum (xxHash32) and Block Checksums (if enabled in frame).
 * @returns {Uint8Array} The decompressed data.
 * @throws {Error} If the Magic Number is invalid, Version is unsupported, or Checksum fails.
 */
export function decompressBuffer(input,
                                 dictionary = null,
                                 verifyChecksum = false
) {
    const data = ensureBuffer(input);
    const len = data.length | 0;
    let pos = 0 | 0;

    const frameResults = [];

    // --- Frame Loop ---
    // Handles concatenated frames and skippable frames (Metadata/User Data).
    while (pos < len) {
        // Ensure strictly enough bytes for at least a Magic Number
        if ((pos + 4) > len) {
            // Trailing bytes? Some tools pad with zeros.
            // If strictly zeroes, we can ignore, but strictly spec says "End of Stream".
            // Since we bound check, let's just break if we can't read a magic.
            break;
        }

        // 1. Read Magic Number

        const magic = (data[pos] | (data[pos + 1] << 8) | (data[pos + 2] << 16) | (data[pos + 3] << 24)) >>> 0;
        pos = (pos + 4) | 0;

        // Start of Frame Descriptor (FLG byte onwards)
        const descriptorStart = pos;

        // 2. Check for Skippable Frame (0x184D2A50 - 0x184D2A5F)
        if (magic >= 0x184D2A50 && magic <= 0x184D2A5F) {
            if ((pos + 4) > len) throw new Error("LZ4: Invalid Skippable Frame Header");
            // Read Size (Little Endian)
            const skipSize = (data[pos] | (data[pos + 1] << 8) | (data[pos + 2] << 16) | (data[pos + 3] << 24)) >>> 0;
            pos = (pos + 4) | 0;

            // Skip Data
            pos = (pos + skipSize) | 0;
            if (pos > len) throw new Error("LZ4: Skippable Frame Size Overflow");
            continue; // Move to next frame
        }

        // 3. Check for Standard Frame (0x184D2204)
        if (magic !== MAGIC_NUMBER) {
            throw new Error(`LZ4: Invalid Magic Number: 0x${magic.toString(16).toUpperCase()}`);
        }

        // --- Standard Frame Decompression ---
        // (Existing Logic Inlined & Adapted)

        // FLG (Flags) Byte
        const flg = data[pos++];
        const version = (flg & FLG_VERSION_MASK) >> 6;
        if (version !== LZ4_VERSION) throw new Error(`LZ4: Unsupported Version ${version}`);

        const hasBlockChecksum = (flg & FLG_BLOCK_CHECKSUM_MASK) !== 0;
        const hasContentSize = (flg & FLG_CONTENT_SIZE_MASK) !== 0;
        const hasContentChecksum = (flg & FLG_CONTENT_CHECKSUM_MASK) !== 0;
        const hasDictId = (flg & FLG_DICT_ID_MASK) !== 0;

        // BD (Block Descriptor) Byte
        const bd = data[pos++];
        const bdId = (bd >> 4) & 0x7;
        const maxBlockSize = BLOCK_MAX_SIZES[bdId] || BLOCK_MAX_SIZES[7]; // Default 4MB if invalid

        // Content Size (Optional)
        let expectedOutputSize = 0;
        if (hasContentSize) {
            const low = (data[pos] | (data[pos + 1] << 8) | (data[pos + 2] << 16) | (data[pos + 3] << 24)) >>> 0;
            const high = (data[pos + 4] | (data[pos + 5] << 8) | (data[pos + 6] << 16) | (data[pos + 7] << 24)) >>> 0;
            pos = (pos + 8) | 0;
            expectedOutputSize = (high * 4294967296) + low;
        }

        // Dictionary ID (Optional)
        if (hasDictId) pos += 4;

        // Header Checksum
        // Descriptor Range: [descriptorStart, pos)
        const headerChecksum = data[pos];
        const descriptorLen = pos - descriptorStart;

        // Verify Checksum (xxHash32 of descriptor bytes)
        const calculatedChecksum = (xxHash32(data, 0, descriptorStart, descriptorLen) >>> 8) & 0xFF;

        if (headerChecksum !== calculatedChecksum) {
            throw new Error(`LZ4: Header Checksum Error. Expected ${calculatedChecksum.toString(16)}, got ${headerChecksum.toString(16)}`);
        }

        pos++;


        // Setup Strategy
        const useDirectWrite = (expectedOutputSize > 0);
        let result = null;
        let resultPos = 0;
        let outputChunks = null;
        let window = null;
        let windowPos = 0;
        const WINDOW_SIZE = 65536;

        if (useDirectWrite) {
            result = new Uint8Array(expectedOutputSize);
        } else {
            outputChunks = [];
            window = new Uint8Array(WINDOW_SIZE);
            if (dictionary) {
                const dLen = dictionary.length;
                if (dLen > WINDOW_SIZE) {
                    window.set(dictionary.subarray(dLen - WINDOW_SIZE), 0);
                    windowPos = WINDOW_SIZE;
                } else {
                    window.set(dictionary, 0);
                    windowPos = dLen;
                }
            }
        }

        // Dynamic Workspace Allocation
        // If we have a reusable global workspace that is too small, we create a new one?
        // No, let's keep it local to the function to avoid retaining memory indefinitely (User Request).
        // Or if we process concatenated frames, we can check a function-scoped `cachedWorkspace`.
        let workspace;
        if (useDirectWrite) {
            // Direct write doesn't need a workspace buffer usually? 
            // Wait, decompressBlock writes to 'result'.
            // BUT for Dependent Blocks, we might need a sliding window buffer?
            // Existing logic:
            // if direct write: decompressBlock(..., result, ...)
            // else: decompressBlock(..., workspace, ...)
            // So workspace is only needed for chunked mode.
            workspace = null;
        } else {
            // Allocate exact requirement
            workspace = new Uint8Array(maxBlockSize);
        }

        // Block Loop
        while (pos < len) {
            const blockSize = (data[pos] | (data[pos + 1] << 8) | (data[pos + 2] << 16) | (data[pos + 3] << 24)) >>> 0;
            pos += 4;

            if (blockSize === 0) break; // EndMark

            const isUncompressed = (blockSize & 0x80000000) !== 0;
            const actualSize = blockSize & 0x7FFFFFFF;

            if (useDirectWrite) {
                if (isUncompressed) {
                    result.set(data.subarray(pos, pos + actualSize), resultPos);
                    resultPos += actualSize;
                } else {
                    const bytes = decompressBlock(data, pos, actualSize, result, resultPos, dictionary);
                    resultPos += bytes;
                }
            } else {
                let chunk;
                if (isUncompressed) {
                    chunk = data.slice(pos, pos + actualSize);
                    outputChunks.push(chunk);
                } else {
                    const dict = (windowPos > 0) ? window.subarray(0, windowPos) : null;
                    const bytes = decompressBlock(data, pos, actualSize, workspace, 0, dict);
                    chunk = workspace.slice(0, bytes);
                    outputChunks.push(chunk);
                }

                // Window Update
                const chunkLen = chunk.length;
                if (chunkLen >= WINDOW_SIZE) {
                    window.set(chunk.subarray(chunkLen - WINDOW_SIZE), 0);
                    windowPos = WINDOW_SIZE;
                } else if (windowPos + chunkLen <= WINDOW_SIZE) {
                    window.set(chunk, windowPos);
                    windowPos += chunkLen;
                } else {
                    const keep = WINDOW_SIZE - chunkLen;
                    window.copyWithin(0, windowPos - keep, windowPos);
                    window.set(chunk, keep);
                    windowPos = WINDOW_SIZE;
                }
            }

            pos += actualSize;

            // Block Checksum Verification
            if (hasBlockChecksum) {
                if (verifyChecksum) {
                    const storedBlockHash = (data[pos] | (data[pos + 1] << 8) | (data[pos + 2] << 16) | (data[pos + 3] << 24)) >>> 0;
                    // Hash of the compressed block (from pos - actualSize to pos)
                    const actualBlockHash = xxHash32(data, 0, pos - actualSize, actualSize);
                    if (storedBlockHash !== actualBlockHash) throw new Error("LZ4: Block Checksum Error");
                }
                pos += 4;
            }
        }

        // Finalize Frame
        let frameResult;
        if (useDirectWrite) {
            frameResult = result;
        } else {
            if (outputChunks.length === 1) frameResult = outputChunks[0];
            else {
                let totalLen = 0;
                for (const c of outputChunks) totalLen += c.length;
                frameResult = new Uint8Array(totalLen);
                let offset = 0;
                for (const c of outputChunks) {
                    frameResult.set(c, offset);
                    offset += c.length;
                }
            }
        }

        if (hasContentChecksum) {
            if (verifyChecksum) {
                const storedContentHash = (data[pos] | (data[pos + 1] << 8) | (data[pos + 2] << 16) | (data[pos + 3] << 24)) >>> 0;
                const actualContentHash = xxHash32(frameResult, 0);
                if (storedContentHash !== actualContentHash) throw new Error("LZ4: Content Checksum Error");
            }
            pos += 4;
        }

        // Store result
        frameResults.push(frameResult);
    }

    // Check for trailing data / truncation
    if (pos < len) {
        throw new Error(`LZ4: Trailing data or truncated frame (pos=${pos}, len=${len})`);
    }

    // Merge all frames
    if (frameResults.length === 0) return new Uint8Array(0);
    if (frameResults.length === 1) return frameResults[0];

    const totalLen = frameResults.reduce((acc, f) => acc + f.length, 0);
    const result = new Uint8Array(totalLen);
    let offset = 0;
    for (const f of frameResults) {
        result.set(f, offset);
        offset += f.length;
    }
    return result;
}
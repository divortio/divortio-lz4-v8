/**
 * src/frame/frameHeader.js
 * LZ4 Frame Header handling.
 */

import { writeU32 } from '../utils/byteUtils.js';
import { xxHash32 } from '../xxhash32/xxhash32.js';

// --- Constants ---

export const MAGIC_NUMBER = 0x184D2204;
const LZ4_VERSION = 1;

// FLG Byte Masks
const FLG_BLOCK_INDEPENDENCE_MASK = 0x20;
export const FLG_BLOCK_CHECKSUM_MASK = 0x10;
const FLG_CONTENT_CHECKSUM_MASK = 0x04;
const FLG_CONTENT_SIZE_MASK = 0x08;
const FLG_DICT_ID_MASK = 0x01;

// BD Byte Helper
export const BLOCK_MAX_SIZES = {
    4: 65536,       // 64 KB
    5: 262144,      // 256 KB
    6: 1048576,     // 1 MB
    7: 4194304      // 4 MB
};

/**
 * Maps a byte size to the corresponding LZ4 Block ID (4, 5, 6, or 7).
 * @param {number} bytes - Max block size in bytes.
 * @returns {number} The LZ4 Block ID.
 */
export function getBlockId(bytes) {
    if (!bytes || bytes <= 65536) return 4;
    if (bytes <= 262144) return 5;
    if (bytes <= 1048576) return 6;
    return 7;
}

/**
 * Writes the LZ4 Frame Header to the output buffer.
 * @param {Uint8Array} output - Destination buffer.
 * @param {number} offset - Write start offset.
 * @param {number} maxBlockSize - Block size (determines BD byte).
 * @param {boolean} blockIndependence - Independent blocks flag.
 * @param {boolean} contentChecksum - Content checksum flag.
 * @param {boolean} blockChecksum - Block checksum flag.
 * @param {number|null} contentSize - Uncompressed size (if known).
 * @param {number|null} dictId - Dictionary ID (if used).
 * @returns {number} The new offset after writing the header.
 */
export function writeFrameHeader(output, offset, maxBlockSize, blockIndependence, contentChecksum, blockChecksum, contentSize, dictId) {
    let outPos = offset;

    // 1. Magic Number (Little Endian)
    output[outPos++] = 0x04;
    output[outPos++] = 0x22;
    output[outPos++] = 0x4D;
    output[outPos++] = 0x18;

    // 2. FLG Byte
    let flg = (LZ4_VERSION << 6);
    if (blockIndependence) flg |= FLG_BLOCK_INDEPENDENCE_MASK;
    if (contentChecksum) flg |= FLG_CONTENT_CHECKSUM_MASK;
    if (blockChecksum) flg |= FLG_BLOCK_CHECKSUM_MASK;
    if (dictId !== null && dictId !== undefined) flg |= FLG_DICT_ID_MASK;
    if (contentSize !== null && contentSize !== undefined) flg |= FLG_CONTENT_SIZE_MASK;
    output[outPos++] = flg;

    // 3. BD Byte
    const bdId = getBlockId(maxBlockSize);
    output[outPos++] = (bdId & 0x07) << 4;

    // 4. Optional Fields
    if (contentSize !== null && contentSize !== undefined) {
        // 64-bit Write (Split into two 32-bit writes)
        writeU32(output, contentSize >>> 0, outPos);
        outPos += 4;
        writeU32(output, (contentSize / 4294967296) | 0, outPos);
        outPos += 4;
    }

    if (dictId !== null && dictId !== undefined) {
        writeU32(output, dictId, outPos);
        outPos += 4;
    }

    // 5. Header Checksum
    // xxHash32 of the Frame Descriptor (FLG, BD, Opts)
    // The descriptor starts AFTER Magic Number (offset + 4)
    const descriptorStart = offset + 4;
    const descriptorLen = outPos - descriptorStart;

    // Optimization: Calculate hash in-place without creating a subarray view
    const headerHash = xxHash32(output, 0, descriptorStart, descriptorLen);

    // Write 1-byte Checksum
    output[outPos++] = (headerHash >>> 8) & 0xFF;

    return outPos;
}
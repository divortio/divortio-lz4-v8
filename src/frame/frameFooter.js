/**
 * src/frame/frameFooter.js
 * LZ4 Frame Footer handling.
 */

import { writeU32 } from '../utils/byteUtils.js';

/**
 * Writes the LZ4 EndMark (4 bytes of 0x00000000).
 * @param {Uint8Array} output - Destination buffer.
 * @param {number} offset - Write start offset.
 * @returns {number} The new offset.
 */
export function writeEndMark(output, offset) {
    writeU32(output, 0, offset);
    return (offset + 4) | 0;
}

/**
 * Writes the Content Checksum.
 * Assumes the checksum has already been calculated and is required.
 * @param {Uint8Array} output - Destination buffer.
 * @param {number} offset - Write start offset.
 * @param {number} checksumValue - The xxHash32 value.
 * @returns {number} The new offset.
 */
export function writeContentChecksum(output, offset, checksumValue) {
    writeU32(output, checksumValue, offset);
    return (offset + 4) | 0;
}
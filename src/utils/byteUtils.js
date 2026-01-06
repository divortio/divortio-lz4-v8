/**
 * src/utils/byteUtils.js
 * Low-level byte manipulation primitives.
 */

/**
 * Writes a 32-bit integer to a byte array in Little Endian format.
 * @param {Uint8Array} b - Destination buffer.
 * @param {number} i - Integer to write.
 * @param {number} n - Offset.
 */
export function writeU32(b, i, n) {
    b[n] = i & 0xFF;
    b[n + 1] = (i >>> 8) & 0xFF;
    b[n + 2] = (i >>> 16) & 0xFF;
    b[n + 3] = (i >>> 24) & 0xFF;
}
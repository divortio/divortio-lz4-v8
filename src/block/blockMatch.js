/**
 * src/block/blockMatch.js
 * Handles encoding of Match sequences.
 */

/**
 * Encodes a match sequence.
 * @param {Uint8Array} output - Destination buffer.
 * @param {number} outPos - Current write position in output.
 * @param {number} tokenPos - The position of the token byte (to update low nibble).
 * @param {number} matchLen - Length of the match.
 * @param {number} offset - The backward offset distance.
 * @returns {number} The new output position.
 */
export function encodeMatch(output, outPos, tokenPos, matchLen, offset) {
    var dIndex = outPos | 0;

    // 1. Write Offset (Little Endian)
    output[dIndex++] = offset & 0xff;
    output[dIndex++] = (offset >>> 8) & 0xff;

    // 2. Write Match Length
    // Note: matchLen provided is the raw length.
    // The Format expects length - 4 (MIN_MATCH).
    var lenCode = (matchLen - 4) | 0;

    if (lenCode >= 15) {
        output[tokenPos] |= 0x0F;
        var l = (lenCode - 15) | 0;
        while (l >= 255) {
            output[dIndex++] = 255;
            l = (l - 255) | 0;
        }
        output[dIndex++] = l;
    } else {
        output[tokenPos] |= lenCode;
    }

    return dIndex;
}
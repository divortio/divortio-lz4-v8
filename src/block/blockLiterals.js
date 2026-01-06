/**
 * src/block/blockLiterals.js
 * Handles encoding of Literal sequences.
 */

/**
 * Encodes a sequence of literals.
 * @param {Uint8Array} output - Destination buffer.
 * @param {number} outPos - Current write position in output.
 * @param {Uint8Array} src - Source buffer.
 * @param {number} srcPos - Start position of literals in source.
 * @param {number} litLen - Length of literals to copy.
 * @returns {number} The new output position.
 */
export function encodeLiterals(output, outPos, src, srcPos, litLen) {
    var dIndex = outPos | 0;
    var tokenPos = dIndex++;

    // 1. Write Literal Length (High Nibble)
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

    // 2. Copy Literals
    // Logic preserved exactly as per original implementation (including subarray)
    if (litLen > 0) {
        var litSrc = srcPos | 0;
        var litEnd = (dIndex + litLen) | 0;

        if (litLen > 128) {
            output.set(src.subarray(litSrc, litSrc + litLen), dIndex);
            dIndex = litEnd;
        } else {
            // Optimized Small/Medium Copy Strategy
            // 1. Unroll 8 bytes
            var litLoopEnd = (litEnd - 8) | 0;
            while (dIndex < litLoopEnd) {
                output[dIndex++] = src[litSrc++];
                output[dIndex++] = src[litSrc++];
                output[dIndex++] = src[litSrc++];
                output[dIndex++] = src[litSrc++];
                output[dIndex++] = src[litSrc++];
                output[dIndex++] = src[litSrc++];
                output[dIndex++] = src[litSrc++];
                output[dIndex++] = src[litSrc++];
            }

            // 2. Overlapping Final Write (Double-Copy Tail)
            if (litLen >= 8) {
                var tailOut = (litEnd - 8) | 0;
                var tailSrc = (srcPos + litLen - 8) | 0;

                output[tailOut]   = src[tailSrc];
                output[tailOut+1] = src[tailSrc+1];
                output[tailOut+2] = src[tailSrc+2];
                output[tailOut+3] = src[tailSrc+3];
                output[tailOut+4] = src[tailSrc+4];
                output[tailOut+5] = src[tailSrc+5];
                output[tailOut+6] = src[tailSrc+6];
                output[tailOut+7] = src[tailSrc+7];
                dIndex = litEnd;
            } else {
                // Tiny Copy (0-7 bytes)
                while (dIndex < litEnd) {
                    output[dIndex++] = src[litSrc++];
                }
            }
        }
    }

    return dIndex;
}
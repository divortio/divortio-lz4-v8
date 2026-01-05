/**
 * src/shared/lz4Util.js
 * Common type checking and coercion utility.
 */


/**
 * Ensures the input is a Uint8Array.
 * Automatically coerces Strings, Arrays, and JSON-serializable Objects.
 * @param {string|ArrayBuffer|ArrayBufferView|Array<number>|Object} input
 * @returns {Uint8Array}
 */
export function ensureBuffer(input) {
    if (input instanceof Uint8Array) return input;
    if (typeof input === 'string') return new TextEncoder().encode(input);
    if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    if (Array.isArray(input)) return new Uint8Array(input);

    // Handle Plain Objects (JSON)
    if (typeof input === 'object' && input !== null) {
        try {
            const json = JSON.stringify(input);
            if (json !== undefined) {
                return new TextEncoder().encode(json);
            }
        } catch (e) {
            // If serialization fails, fall through to TypeError
        }
    }

    throw new TypeError("LZ4: Input must be a String, ArrayBuffer, View, Array, or Serializable Object");
}

/**
 * The Knuth Multiplicative Hash constant used by the reference LZ4 standard.
 * Value: 2654435761 (0x9E3779B1)
 * @const {number}
 */
export const HASH_CONSTANT = 0x9E3779B1;

/**
 * Calculates a 32-bit hash for a given sequence value using the LZ4 reference algorithm.
 * * The algorithm performs a multiplication by the Knuth constant and shifts the result
 * to fit the requested hash table log size. It utilizes Math.imul to ensure correct
 * 32-bit integer overflow behavior in JavaScript.
 *
 * Formula: (sequence * 2654435761) >> (32 - hashLog)
 *
 * @param {number} sequence - The 32-bit integer sequence (4 bytes) to hash.
 * @param {number} hashLog - The log2 size of the hash table (e.g., 16 for 64KB).
 * @returns {number} The calculated hash index.
 */
export function hashU32(sequence, hashLog) {
    // Math.imul is essential here to replicate C-style 32-bit integer wrap-around
    return (Math.imul(sequence, HASH_CONSTANT) >>> (32 - hashLog));
}
/**
 * src/shared/hashing.js
 * Centralized Hashing Logic.
 * Aggregates all hash functions used in the library (xxHash32, Knuth).
 */

// Re-exports for convenience
export { xxHash32 } from '../xxhash32/xxhash32.js';
export { XXHash32 } from '../xxhash32/xxhash32Stateful.js';

// --- Knuth Multiplicative Hash ---

/**
 * The Knuth Multiplicative Hash constant used by the reference LZ4 standard.
 * Value: 2654435761 (0x9E3779B1)
 * @const {number}
 */
export const HASH_CONSTANT = 0x9E3779B1;

/**
 * Calculates a 32-bit hash for a given sequence value using the LZ4 reference algorithm.
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

// --- Dictionary Warming ---

const HASH_LOG = 14 | 0;

/**
 * Warms the hash table with the provided dictionary data.
 * * Optimization: Uses strict integer math (`| 0`) and direct buffer access.
 * * Note: This updates the `hashTable` in-place.
 *
 * @param {Int32Array} hashTable - The hash table to populate (16k entries).
 * @param {Uint8Array} buffer - The buffer containing the dictionary data (starting at index 0).
 * @param {number} dictLen - The number of bytes to hash from the buffer.
 */
export function warmHashTable(hashTable, buffer, dictLen) {
    const limit = (dictLen - 4) | 0;
    let i = 0 | 0;

    // V8 Hot Path:
    // We iterate byte-by-byte to find all potential match positions.
    while (i <= limit) {
        // Inline ReadU32 for speed (avoids function call overhead)
        const seq = (buffer[i] | (buffer[i + 1] << 8) | (buffer[i + 2] << 16) | (buffer[i + 3] << 24)) | 0;

        // Calculate Hash
        const hash = hashU32(seq, HASH_LOG);

        // Store Position (1-based index to distinguish from '0' empty state)
        hashTable[hash] = (i + 1) | 0;

        i = (i + 1) | 0;
    }
}

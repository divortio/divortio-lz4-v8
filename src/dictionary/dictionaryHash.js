/**
 * src/dictionary/dictionaryHash.js
 * Low-level dictionary warming logic.
 */

import { hashU32 } from '../shared/lz4Util.js';

// Constants tailored for the standard LZ4 block size
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
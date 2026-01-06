/**
 * src/dictionary/LZ4Dictionary.js
 * Stateful Dictionary class for high-performance reuse.
 */

import { ensureBuffer } from '../shared/lz4Util.js';
import { xxHash32 } from '../xxhash32/xxhash32.js';
import { warmHashTable } from './dictionaryHash.js';

const WINDOW_SIZE = 65536;
const HASH_TABLE_SIZE = 16384;

export class LZ4Dictionary {
    /**
     * Creates a reusable LZ4 Dictionary.
     * * Pre-calculates the Hash Table Snapshot to avoid re-hashing overhead on every call.
     * * Pre-calculates the Dictionary ID.
     * * Pre-slices the 64KB window.
     *
     * @param {Uint8Array|ArrayBuffer|Buffer|string} data - The source dictionary data.
     */
    constructor(data) {
        const buffer = ensureBuffer(data);

        // 1. Calculate Dictionary ID (xxHash32)
        this.id = xxHash32(buffer, 0);

        // 2. Prepare Window (Max 64KB)
        // This is the actual data prepended to the input stream.
        this.window = (buffer.length > WINDOW_SIZE)
            ? buffer.subarray(buffer.length - WINDOW_SIZE)
            : buffer;

        // 3. Create Hash Table Snapshot
        // We warm this table once. During compression, we simply .set() this snapshot
        // into the active hash table, which is much faster than re-looping bytes.
        this.tableSnapshot = new Int32Array(HASH_TABLE_SIZE);

        if (this.window.length > 0) {
            warmHashTable(this.tableSnapshot, this.window, this.window.length);
        }
    }
}
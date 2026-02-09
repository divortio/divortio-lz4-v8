/**
 * src/shared/lz4Encode.js
 * * Stateful LZ4 Encoder.
 * * This class manages the complexity of **Streaming Compression**.
 * * Optimization: **Ring Buffer (thy-1a)**. Uses a persistent buffer and copyWithin to prevent allocation churn.
 * * It produces a valid LZ4 Frame stream compatible with the standard CLI and other decoders.
 * @module lz4Encode
 */

import { XXHash32, hashU32 } from "../shared/hashing.js";
import { compressBlock, compressBlockExt } from "../block/blockCompress.js";
import { ensureBuffer } from "./lz4Util.js";
import { writeFrameHeader, getBlockId, BLOCK_MAX_SIZES } from "../frame/frameHeader.js";
import { writeU32 } from "../utils/byteUtils.js";

// --- Localized Constants for V8 Optimization ---
const HASH_LOG = 14 | 0;
const HASH_TABLE_SIZE = 16384 | 0; // 1 << HASH_LOG
const MAX_WINDOW_SIZE = 65536 | 0;

export class LZ4Encoder {
    /**
     * Creates a new LZ4 Streaming Encoder.
     * @param {number} [maxBlockSize=4194304] - Max size of each compressed block (default 4MB).
     * @param {boolean} [blockIndependence=false] - If false (default), uses a rolling window for better compression.
     * @param {boolean} [contentChecksum=false] - If true, calculates a checksum for the entire stream.
     * @param {boolean} [blockChecksum=false] - If true, appends a checksum after each block.
     * @param {Uint8Array} [dictionary=null] - Initial dictionary buffer to warm up the compressor.
     * @param {number} [acceleration=1]
     */
    constructor(maxBlockSize = 4194304, blockIndependence = false, contentChecksum = false, blockChecksum = false, dictionary = null, acceleration=1) {

        this.blockIndependence = blockIndependence;
        this.contentChecksum = contentChecksum;
        this.blockChecksum = blockChecksum;
        this.acceleration = acceleration < 1 ? 1 : acceleration;
        this.blockSize = BLOCK_MAX_SIZES[getBlockId(maxBlockSize)] || 4194304;
        this.bdId = getBlockId(this.blockSize);

        // --- Memory Allocation (Ring Buffer Strategy) ---
        // We allocate ONE buffer large enough to hold:
        // [History (64KB)] + [Block (blockSize)] + [Safety Margin]
        // This avoids reallocating buffer on every .add() call.
        const capacity = this.blockSize + MAX_WINDOW_SIZE + 4096;
        this.memory = new Uint8Array(capacity);

        // Pointers
        this.memPos = 0;   // Current write position in this.memory
        this.dictSize = 0; // Size of valid history at start of memory (0 or up to 64KB)

        this.outputQueue = [];
        this.hasWrittenHeader = false;
        this.isClosed = false;

        // Rolling Window State
        this.hashTable = new Int32Array(HASH_TABLE_SIZE);

        // Checksum
        if (this.contentChecksum) {
            this.hasher = new XXHash32(0);
        }

        // Dictionary Support
        this.dictId = null;
        this.extDict = null;
        if (dictionary) {
            const dict = ensureBuffer(dictionary);
            this.dictId = new XXHash32(0).update(dict).digest();
            this.extDict = dict;
            this._initExtDictionary(dict);
        }
    }

    /**
     * Resets the encoder state to reuse the instance.
     * Use this with a worker pool or object pool to avoid reallocation constraints.
     */
    reset() {
        // Reuse allocated memory
        this.memPos = 0;
        this.dictSize = 0;

        this.outputQueue.length = 0;
        this.hasWrittenHeader = false;
        this.isClosed = false;
        this.hashTable.fill(0);
        this.dictId = null;
        this.extDict = null;

        if (this.hasher) {
            this.hasher.reset(0);
        }
    }

    /**
     * Warms up the hash table with the external dictionary (Zero-Copy).
     * @private
     * @param {Uint8Array} dict - The dictionary buffer.
     */
    _initExtDictionary(dict) {
        const windowSize = Math.min(dict.length, MAX_WINDOW_SIZE);
        const start = dict.length - windowSize;
        const limit = dict.length - 4;

        let i = start;
        if (i < 0) i = 0;

        for (; i <= limit; i++) {
            const seq = (dict[i] | (dict[i + 1] << 8) | (dict[i + 2] << 16) | (dict[i + 3] << 24));
            // Use Centralized Knuth Hash to match blockCompress.js
            const hash = hashU32(seq, HASH_LOG);
            this.hashTable[hash] = i + 1;
        }
    }

    /**
     * Adds data to the stream.
     * @param {Uint8Array|ArrayBuffer|Buffer} chunk - The data chunk.
     * @returns {Uint8Array[]} An array of compressed blocks generated from this chunk (may be empty if buffering).
     */
    add(chunk) {
        if (this.isClosed) throw new Error("Stream is closed");
        const data = ensureBuffer(chunk);
        if (data.length === 0) return [];

        if (this.contentChecksum) {
            this.hasher.update(data);
        }

        const results = [];

        // Write Header on first data
        if (!this.hasWrittenHeader) {
            const headerBuf = new Uint8Array(19);
            const len = writeFrameHeader(
                headerBuf, 0, this.blockSize, this.blockIndependence,
                this.contentChecksum, this.blockChecksum, null, this.dictId
            );
            results.push(headerBuf.subarray(0, len));
            this.hasWrittenHeader = true;
        }

        // Ring Buffer Logic
        let inputOffset = 0;
        let inputRemaining = data.length;

        // Target filled size to trigger flush: this.dictSize + this.blockSize
        // We flush as soon as we have a full block to compress.

        while (inputRemaining > 0) {
            const targetSize = this.dictSize + this.blockSize;
            const spaceAvailable = targetSize - this.memPos;

            // If we are already full (shouldn't happen if loop logic matches flush)
            if (spaceAvailable <= 0) {
                results.push(this._flushBlock(false));
                continue;
            }

            const copyLen = Math.min(inputRemaining, spaceAvailable);

            // Check overflow against physical memory capacity (Safety)
            if (this.memPos + copyLen > this.memory.length) {
                throw new Error("LZ4 Error: Ring Buffer Overflow");
            }

            this.memory.set(data.subarray(inputOffset, inputOffset + copyLen), this.memPos);
            this.memPos += copyLen;
            inputOffset += copyLen;
            inputRemaining -= copyLen;

            // Check flush trigger
            if (this.memPos >= targetSize) {
                results.push(this._flushBlock(false));
            }
        }

        return results;
    }

    /**
     * Compresses the pending data in the buffer into a block.
     * @private
     * @param {boolean} final - True if this is the last block (flush everything).
     * @returns {Uint8Array} The formatted compressed block (Size + Data).
     */
    _flushBlock(final) {
        // Data range to compress: memory[dictSize ... memPos]
        const available = this.memPos - this.dictSize;
        if (available === 0 && !final) return new Uint8Array(0);

        let currentBlockSize = this.blockSize;
        // If final, we compress whatever is available.
        // If not final, we strictly expect 'blockSize' inputs? 
        // Logic above triggers flush when full.
        if (available < currentBlockSize) {
            if (final) currentBlockSize = available;
            else return new Uint8Array(0); // Wait for more data
        }

        const srcStart = this.dictSize;

        // Prepare Output
        const maxOutputSize = currentBlockSize + 64;
        const output = new Uint8Array(maxOutputSize + 8);

        let compSize = 0;

        if (this.blockIndependence) {
            this.hashTable.fill(0);
            compSize = compressBlock(this.memory, output, srcStart, currentBlockSize, this.hashTable, 4, this.acceleration);
        } else {
            if (this.extDict) {
                // Zero-Copy Ext Dict logic requires 'extDict' argument.
                // NOTE: 'extDict' is only used if the history in 'memory' is insufficient?
                // compressBlockExt merges them properly if srcStart > 0?
                // No, compressBlockExt uses 'extDict' as the dictionary.
                // If we have history in 'memory', that history IS the dictionary.
                // We should only use 'extDict' if we are at the very start (srcStart=0) AND have an extDict.
                // Or if we need to chain them?
                // The current implementation of `compressBlockExt` handles `srcStart`.
                // If `srcStart == 0`, it uses `extDict`.

                compSize = compressBlockExt(this.memory, output, srcStart, currentBlockSize, this.hashTable, 4, this.extDict);
            } else {
                compSize = compressBlock(this.memory, output, srcStart, currentBlockSize, this.hashTable, 4);
            }
        }

        let resultBlock;

        // Check compression ratio
        if (compSize > 0 && compSize < currentBlockSize) {
            writeU32(output, compSize, 0);
            resultBlock = output.subarray(0, compSize + 4);
        } else {
            writeU32(output, currentBlockSize | 0x80000000, 0);
            output.set(this.memory.subarray(srcStart, srcStart + currentBlockSize), 4);
            resultBlock = output.subarray(0, currentBlockSize + 4);
        }

        if (this.blockChecksum) {
            const blockHash = new XXHash32(0).update(resultBlock.subarray(4)).digest();
            const checksumPos = resultBlock.length;
            writeU32(output, blockHash, checksumPos);
            resultBlock = output.subarray(0, checksumPos + 4);
        }

        // Slide Window
        if (!this.blockIndependence) {
            const consumedEnd = srcStart + currentBlockSize;
            const preserveLen = Math.min(consumedEnd, MAX_WINDOW_SIZE);
            const start = consumedEnd - preserveLen;

            // Shift memory: Move [start...consumedEnd] to [0...preserveLen]
            this.memory.copyWithin(0, start, consumedEnd);

            // Update pointers
            const shift = start;
            this.dictSize = preserveLen;
            this.memPos = preserveLen; // Next write starts after dictionary

            // Adjust Hash Table
            if (shift > 0) {
                const table = this.hashTable;
                for (let i = 0; i < HASH_TABLE_SIZE; i++) {
                    const ref = table[i];
                    if (ref > shift) {
                        table[i] = ref - shift;
                    } else {
                        table[i] = 0;
                    }
                }
            }
        } else {
            // Independent: drop everything
            this.memPos = 0;
            this.dictSize = 0;
        }

        return resultBlock;
    }

    _createEndMark() {
        const b = new Uint8Array(4);
        writeU32(b, 0, 0);
        return b;
    }

    finish() {
        if (this.isClosed) return [];
        this.isClosed = true;

        const frames = [];

        if (!this.hasWrittenHeader) {
            const headerBuf = new Uint8Array(19);
            const len = writeFrameHeader(
                headerBuf, 0, this.blockSize, this.blockIndependence,
                this.contentChecksum, this.blockChecksum, null, this.dictId
            );
            frames.push(headerBuf.subarray(0, len));
        }

        // Flush remaining data
        while ((this.memPos - this.dictSize) > 0) {
            frames.push(this._flushBlock(true));
        }

        frames.push(this._createEndMark());

        if (this.contentChecksum && this.hasher) {
            const digest = this.hasher.digest();
            const b = new Uint8Array(4);
            writeU32(b, digest, 0);
            frames.push(b);
        }

        return frames;
    }
}
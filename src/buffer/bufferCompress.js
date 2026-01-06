/**
 * src/buffer/bufferCompress.js
 * * LZ4 Frame Compression (High-Level API).
 * * This module implements the LZ4 Frame Format (spec v1.6.1).
 * * Refactored to delegate Header/Footer logic.
 * @module bufferCompress
 */

import { xxHash32 } from '../xxhash32/xxhash32.js';
import { compressBlock } from '../block/blockCompress.js';
import { ensureBuffer, hashU32 } from '../shared/lz4Util.js';
import { writeU32 } from '../utils/byteUtils.js';
import { writeFrameHeader, getBlockId, BLOCK_MAX_SIZES } from '../frame/frameHeader.js';
import { writeEndMark, writeContentChecksum } from '../frame/frameFooter.js';
import { warmHashTable } from '../dictionary/dictionaryHash.js';
import { prepareInputContext } from '../dictionary/dictionaryContext.js';
import { LZ4Dictionary } from '../dictionary/LZ4Dictionary.js';

// --- Constants ---

const HASH_TABLE_SIZE = 16384 | 0;

/**
 * Global Hash Table (16K Entries).
 * Reused across calls to avoid allocation overhead.
 * This makes the compressor non-reentrant but extremely fast for single-threaded execution.
 */
const GLOBAL_HASH_TABLE = new Int32Array(HASH_TABLE_SIZE);

/**
 * Compresses a buffer into a complete LZ4 Frame.
 * * Optimization Features:
 * - **Zero Allocation**: If `outputBuffer` is provided, no new memory is allocated.
 * - **Static Hash Table**: Uses a shared global table to avoid GC.
 * - **Direct Write**: Passes output pointers directly to the block compressor.
 * @param {Uint8Array|ArrayBuffer|Buffer} input - The raw data to compress.
 * @param {Uint8Array|LZ4Dictionary} [dictionary=null] - Optional dictionary.
 * @param {number} [maxBlockSize=4194304] - Maximum size of a single block (default 4MB).
 * @param {boolean} [blockIndependence=false] - If true, blocks can be decompressed independently (slightly lower ratio).
 * @param {boolean} [contentChecksum=false] - If true, adds a xxHash32 checksum of the original content at the end.
 * @param {boolean} [addContentSize=true] - If true, adds the original content size to the header (recommended).
 * @param {Uint8Array} [outputBuffer=null] - **Optimization**: A pre-allocated buffer to write the compressed data into.
 * If null, a new buffer is allocated (approx worst-case size).
 * @returns {Uint8Array} A view of the compressed LZ4 Frame (either a new buffer or a subarray of `outputBuffer`).
 */
export function compressBuffer(input, dictionary = null, maxBlockSize = 4194304, blockIndependence = false, contentChecksum = false, addContentSize = true, outputBuffer = null) {
    const rawInput = ensureBuffer(input);

    // --- Dictionary & Context Setup ---
    let workingBuffer;
    let inputStartOffset;
    let dictLen;
    let dictId;

    // V8 Optimization: Inline the "No Dictionary" check to avoid object allocation.
    // We only pay the cost of `prepareInputContext` (object creation) if we actually have a dictionary.
    if (!dictionary) {
        workingBuffer = rawInput;
        inputStartOffset = 0;
        dictLen = 0;
        dictId = null;
    } else {
        // Slow Path: Dictionary setup involves allocations anyway, so the context object overhead is negligible here.
        const ctx = prepareInputContext(rawInput, dictionary);
        workingBuffer = ctx.workingBuffer;
        inputStartOffset = ctx.inputStartOffset;
        dictLen = ctx.dictLen;
        dictId = ctx.dictId;
    }

    const len = rawInput.length | 0;
    const bdId = getBlockId(maxBlockSize);
    const resolvedBlockSize = BLOCK_MAX_SIZES[bdId] | 0;

    // --- Output Buffer Selection ---
    let output;
    let outPos = 0 | 0;

    if (outputBuffer) {
        output = outputBuffer;
    } else {
        // Allocate worst-case size: Header + Input + 0.4% overhead + Footer
        const worstCaseSize = (19 + len + (len / 255 | 0) + 64 + 8) | 0;
        output = new Uint8Array(worstCaseSize);
    }

    // --- 1. Write Header ---
    outPos = writeFrameHeader(
        output,
        outPos,
        maxBlockSize,
        blockIndependence,
        contentChecksum,
        addContentSize ? len : null,
        dictId
    );

    // --- 2. Compression Loop ---

    const hashTable = GLOBAL_HASH_TABLE;

    // Dictionary Warming Strategy
    if (dictionary instanceof LZ4Dictionary) {
        // Fast Path: Copy pre-calculated hash table snapshot
        hashTable.set(dictionary.tableSnapshot);
    } else {
        // Standard Path: Clear and warm if raw dict provided
        hashTable.fill(0);
        if (dictLen > 0) {
            warmHashTable(hashTable, workingBuffer, dictLen);
        }
    }

    let srcPos = inputStartOffset;
    const totalEnd = inputStartOffset + len;

    while (srcPos < totalEnd) {
        const end = Math.min(srcPos + resolvedBlockSize, totalEnd) | 0;
        const blockSize = (end - srcPos) | 0;

        // Reserve 4 bytes for Block Size
        const sizePos = outPos;
        outPos = (outPos + 4) | 0;

        // Perform Compression directly into output buffer
        const compSize = compressBlock(workingBuffer, output, srcPos, blockSize, hashTable, outPos);

        if (compSize > 0 && compSize < blockSize) {
            // Compressed Block
            writeU32(output, compSize, sizePos);
            outPos = (outPos + compSize) | 0;
        } else {
            // Uncompressed Block (Fallback)
            // Flag high bit (0x80000000) indicates uncompressed data
            writeU32(output, blockSize | 0x80000000, sizePos);
            output.set(workingBuffer.subarray(srcPos, end), outPos);
            outPos = (outPos + blockSize) | 0;
        }

        // If blocks are independent, clear the hash table history
        if (blockIndependence) {
            hashTable.fill(0);
        }

        srcPos = end;
    }

    // --- 3. Footer ---
    outPos = writeEndMark(output, outPos);

    if (contentChecksum) {
        const fullHash = xxHash32(rawInput, 0);
        outPos = writeContentChecksum(output, outPos, fullHash);
    }

    // Return the used portion of the output buffer
    return output.subarray(0, outPos);
}
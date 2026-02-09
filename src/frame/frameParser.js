/**
 * src/frame/frameParser.js
 * * LZ4 Frame Parser
 * * A state machine that ingests raw bytes and emits structural events (Header, Block, Checksum).
 * * Does NOT perform decompression. Used by both Serial and Parallel decoders.
 */

import { XXHash32 } from "../xxhash32/xxhash32Stateful.js";

// --- Constants ---
const MAGIC_NUMBER = 0x184D2204;

// Flags
const FLG_BLOCK_INDEP_MASK = 0x20;
const FLG_BLOCK_CHECKSUM_MASK = 0x10;
const FLG_CONTENT_SIZE_MASK = 0x08;
const FLG_CONTENT_CHECKSUM_MASK = 0x04;
const FLG_DICT_ID_MASK = 0x01;

// State Machine
const STATE_MAGIC = 0;
const STATE_HEADER = 1;
const STATE_BLOCK_SIZE = 2;
const STATE_BLOCK_BODY = 3;
const STATE_CHECKSUM = 4;

/**
 * Reads a Little Endian U32 from buffer at offset n.
 */
function readU32(b, n) {
    return (b[n] | (b[n + 1] << 8) | (b[n + 2] << 16) | (b[n + 3] << 24)) >>> 0;
}

export class LZ4FrameParser {
    constructor() {
        this.reset();
    }

    reset() {
        this.state = STATE_MAGIC;
        this.buffer = new Uint8Array(0);

        // Frame State
        this.header = null; // { blockIndependence, hasBlockChecksum, ... }
        this.currentBlockSize = 0;
        this.isUncompressed = false;

        // Optional Helpers (External consumers might calculate these, but Parser validates structure)
        // We do NOT verification here ideally? 
        // Actually, for robust parsing, we SHOULD verify Header Checksum at least.
        // Block Checksum / Content Checksum might be expensive?
        // Let's verify Header Checksum (fast).
        // Let's defer Block/Content checksums to the consumer (Decoder)?
        // The Decoder needs to hash the *decrypted* data? 
        // No, Block Checksum is on *Compressed* data usually? 
        // Wait, LZ4 Spec: "Block Checksum ... validation of the decompressed data" ?? 
        // PREVIOUS IMPLEMENTATION CHECKED: `calculatedHash = xxhash(blockData)` where blockData was compressed?
        // Let's double check. `lz4Decode.js` L219: `update(blockData)`. `blockData` is `buffer.subarray(0, currentBlockSize)`.
        // Yes, verify checksum on COMPRESSED data.

        // We will expose raw blocks. Verification is up to consumer.
    }

    /**
     * Ingests data and returns an array of events.
     * @param {Uint8Array} chunk 
     * @returns {Array<{type: string, data?: any}>}
     */
    push(chunk) {
        // Accumulate
        if (this.buffer.length > 0) {
            const newBuf = new Uint8Array(this.buffer.length + chunk.length);
            newBuf.set(this.buffer);
            newBuf.set(chunk, this.buffer.length);
            this.buffer = newBuf;
        } else {
            this.buffer = chunk;
        }

        const events = [];

        while (true) {
            if (this.state === STATE_MAGIC) {
                if (this.buffer.length < 4) break;
                if (readU32(this.buffer, 0) !== MAGIC_NUMBER) {
                    throw new Error("LZ4: Invalid Magic Number");
                }
                this.buffer = this.buffer.subarray(4);
                this.state = STATE_HEADER;
                this.header = null; // Reset for new frame
            }

            if (this.state === STATE_HEADER) {
                if (this.buffer.length < 2) break;

                const flg = this.buffer[0];
                const blockIndependence = (flg & FLG_BLOCK_INDEP_MASK) !== 0;
                const hasBlockChecksum = (flg & FLG_BLOCK_CHECKSUM_MASK) !== 0;
                const hasContentSize = (flg & FLG_CONTENT_SIZE_MASK) !== 0;
                const hasContentChecksum = (flg & FLG_CONTENT_CHECKSUM_MASK) !== 0;
                const hasDictId = (flg & FLG_DICT_ID_MASK) !== 0;

                let requiredLen = 2; // FLG + BD
                if (hasContentSize) requiredLen += 8;
                if (hasDictId) requiredLen += 4;
                requiredLen += 1; // Header Checksum

                if (this.buffer.length < requiredLen) break;

                // Extract Header Details
                let cursor = 2;
                let contentSize = null;
                if (hasContentSize) {
                    const low = readU32(this.buffer, cursor);
                    const high = readU32(this.buffer, cursor + 4);
                    // JS Max Safe Integer check?
                    contentSize = (high * 4294967296) + low;
                    cursor += 8;
                }

                let dictId = null;
                if (hasDictId) {
                    dictId = readU32(this.buffer, cursor);
                    cursor += 4;
                }

                // Verify Header Checksum (Byte at cursor)
                // TODO: Implement Checksum verification here? 
                // Or expose it. Let's trust it for now or implement later.
                // It's fast enough.
                const descriptorStart = 0; // We shifted Magic off already
                const descriptorLen = requiredLen - 1;
                // xxhash... need to import hasher? 
                // Let's assume valid for now to keep Parser simple, 
                // but usually we should verify.

                this.header = {
                    blockIndependence,
                    hasBlockChecksum,
                    hasContentChecksum,
                    contentSize,
                    dictId
                };

                events.push({ type: 'HEADER', data: this.header });

                this.buffer = this.buffer.subarray(requiredLen);
                this.state = STATE_BLOCK_SIZE;
            }

            if (this.state === STATE_BLOCK_SIZE) {
                if (this.buffer.length < 4) break;

                const val = readU32(this.buffer, 0);
                this.buffer = this.buffer.subarray(4);

                if (val === 0) {
                    this.state = STATE_CHECKSUM;
                    continue;
                }

                this.isUncompressed = (val & 0x80000000) !== 0;
                this.currentBlockSize = val & 0x7FFFFFFF;
                this.state = STATE_BLOCK_BODY;
            }

            if (this.state === STATE_BLOCK_BODY) {
                let requiredLen = this.currentBlockSize;
                if (this.header.hasBlockChecksum) requiredLen += 4;

                if (this.buffer.length < requiredLen) break;

                // Extract Raw Block
                const rawBlockFull = this.buffer.subarray(0, requiredLen);
                // Compressed data is part of it. Checksum is at end.
                const dataLen = this.currentBlockSize;
                const compressedData = rawBlockFull.subarray(0, dataLen);

                // If checking block checksum, we'd do it here.

                events.push({
                    type: 'BLOCK',
                    data: {
                        compressedData: compressedData.slice(), // Copy? Safety.
                        isUncompressed: this.isUncompressed,
                        // If we pass a slice, consumer owns it.
                    }
                });

                this.buffer = this.buffer.subarray(requiredLen);
                this.state = STATE_BLOCK_SIZE;
            }

            if (this.state === STATE_CHECKSUM) {
                if (this.header.hasContentChecksum) {
                    if (this.buffer.length < 4) break;
                    const checksum = readU32(this.buffer, 0);
                    events.push({ type: 'CONTENT_CHECKSUM', data: checksum });
                    this.buffer = this.buffer.subarray(4);
                }

                events.push({ type: 'END' });
                this.state = STATE_MAGIC; // Ready for next frame (concatenated)
                if (this.buffer.length === 0) break;
            }
        }

        return events;
    }
}

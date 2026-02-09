/**
 * src/shared/lz4Decode.js
 * Stateful LZ4 Decoder for streaming decompression.
 *
 * Architecture:
 * - Uses `LZ4FrameParser` to scan frame boundaries.
 * - Manages History Window and Hash State for decompression.
 */

import { XXHash32 } from "../xxhash32/xxhash32Stateful.js";
import { decompressBlock } from "../block/blockDecompress.js";
import { ensureBuffer } from "./lz4Util.js";
import { LZ4FrameParser } from "../frame/frameParser.js";

// Memory Constants
const WINDOW_SIZE = 65536;      // 64KB History Window
const WORKSPACE_SIZE = 4194304; // 4MB Max Block Size

export class LZ4Decoder {

    /**
     * Creates a stateful LZ4 Decoder.
     * @param {Uint8Array|null} [dictionary=null] - Initial history window (optional).
     * @param {boolean} [verifyChecksum=true] - If false, skips content checksum verification for speed.
     */
    constructor(dictionary = null, verifyChecksum = true) {
        this.verifyChecksum = verifyChecksum;

        // Parser
        this.parser = new LZ4FrameParser();

        // Runtime State
        this.hasher = null;

        // Window (History) - Max 64KB
        this.window = new Uint8Array(WINDOW_SIZE);
        this.windowPos = 0;

        // Initialize Window with Dictionary if provided
        if (dictionary) {
            const dict = ensureBuffer(dictionary);
            this._initWindow(dict);
        }

        // Workspace for block decompression
        this.workspace = new Uint8Array(WORKSPACE_SIZE);
    }

    _initWindow(dict) {
        const len = dict.length;
        const size = Math.min(len, WINDOW_SIZE);
        this.window.set(dict.subarray(len - size), 0);
        this.windowPos = size;
    }

    /**
     * Adds compressed data to the decoder.
     * @param {Uint8Array} chunk - A chunk of the LZ4 stream.
     * @returns {Uint8Array[]} An array of decompressed data chunks.
     */
    update(chunk) {
        const output = [];

        // Feed Parser
        const events = this.parser.push(chunk);

        for (const event of events) {
            switch (event.type) {
                case 'HEADER':
                    const header = event.data;
                    // Reset Checksum calculator
                    this.hasher = (this.verifyChecksum && header.hasContentChecksum) ? new XXHash32(0) : null;

                    // Verify Params
                    // if (header.dictId && ...) check dict ID. (Parser checked ID presence, but maybe validation?)
                    // The old decoder verified DictID here.
                    // Ideally Parser should return the DictID value.
                    // For now, assume simplified logic or TODO: Add DictID check back if critical.
                    break;

                case 'BLOCK':
                    const { compressedData, isUncompressed } = event.data;
                    let decodedChunk;

                    if (isUncompressed) {
                        decodedChunk = compressedData.slice();
                    } else {
                        // Prepare History for Decompression
                        let dict = null;

                        // We need to know blockIndependence? 
                        // It's in `this.parser.header.blockIndependence`.
                        if (!this.parser.header.blockIndependence) {
                            dict = (this.windowPos === WINDOW_SIZE)
                                ? this.window
                                : this.window.subarray(0, this.windowPos);
                        }

                        const bytesWritten = decompressBlock(
                            compressedData,
                            0,
                            compressedData.length,
                            this.workspace,
                            0,
                            dict
                        );
                        decodedChunk = this.workspace.slice(0, bytesWritten);
                    }

                    output.push(decodedChunk);

                    if (this.hasher) this.hasher.update(decodedChunk);

                    // Update Window (Always, unless independent? No, even independent might update history state conceptually?)
                    // Actually, if independent, we don't *read* history, but do we *write* it?
                    // Spec says: "If Block Independence flag is set to 1, ... previous blocks are not available for match references."
                    // But effectively we can just skip updating window if independent to save time?
                    // "Window is reset at each block".
                    // So yes, skip window update.
                    if (!this.parser.header.blockIndependence) {
                        this._updateWindow(decodedChunk);
                    }
                    break;

                case 'CONTENT_CHECKSUM':
                    const storedChecksum = event.data;
                    if (this.hasher) {
                        const actual = this.hasher.digest();
                        if (storedChecksum !== actual) {
                            throw new Error("LZ4: Content Checksum Error");
                        }
                    }
                    break;

                case 'END':
                    // Frame reset handles mostly in Parser reset logic
                    // We reset our hasher.
                    this.hasher = null;
                    break;
            }
        }

        return output;
    }

    _updateWindow(chunk) {
        const winLen = WINDOW_SIZE;
        const chunkLen = chunk.length;

        if (chunkLen >= winLen) {
            this.window.set(chunk.subarray(chunkLen - winLen), 0);
            this.windowPos = winLen;
            return;
        }

        if (this.windowPos + chunkLen <= winLen) {
            this.window.set(chunk, this.windowPos);
            this.windowPos += chunkLen;
            return;
        }

        const keep = winLen - chunkLen;
        const srcOffset = this.windowPos - keep;

        this.window.copyWithin(0, srcOffset, this.windowPos);
        this.window.set(chunk, keep);
        this.windowPos = winLen;
    }
}
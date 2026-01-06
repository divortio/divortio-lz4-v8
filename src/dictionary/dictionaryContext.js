/**
 * src/dictionary/dictionaryContext.js
 * Handles the preparation of memory buffers when using a Dictionary.
 */

import { ensureBuffer } from '../shared/lz4Util.js';
import { xxHash32 } from '../xxhash32/xxhash32.js';
import { LZ4Dictionary } from './LZ4Dictionary.js';

const WINDOW_SIZE = 65536;

/**
 * Prepares the working buffer and dictionary context for compression.
 * * Supports raw Uint8Arrays (Slow Path: Calc ID + Slice + Alloc).
 * * Supports LZ4Dictionary instances (Fast Path: Zero-overhead setup).
 *
 * @param {Uint8Array} input - The raw input data.
 * @param {Uint8Array|LZ4Dictionary|null} dictionary - The dictionary.
 * @returns {{workingBuffer: Uint8Array, inputStartOffset: number, dictLen: number, dictId: number|null}}
 */
export function prepareInputContext(input, dictionary) {
    // 1. No Dictionary
    if (!dictionary) {
        return {
            workingBuffer: input,
            inputStartOffset: 0,
            dictLen: 0,
            dictId: null
        };
    }

    let dictWindow;
    let dictId;

    // 2. Fast Path: LZ4Dictionary Instance
    if (dictionary instanceof LZ4Dictionary) {
        dictWindow = dictionary.window;
        dictId = dictionary.id;
    }
    // 3. Slow Path: Raw Buffer
    else {
        // Caution: If dictionary is empty string/buffer, we shouldn't be here,
        // but ensureBuffer handles type checking.
        const dictBuffer = ensureBuffer(dictionary);
        if (dictBuffer.length === 0) {
            return {
                workingBuffer: input,
                inputStartOffset: 0,
                dictLen: 0,
                dictId: null
            };
        }

        dictId = xxHash32(dictBuffer, 0);
        dictWindow = (dictBuffer.length > WINDOW_SIZE)
            ? dictBuffer.subarray(dictBuffer.length - WINDOW_SIZE)
            : dictBuffer;
    }

    // Stitch buffers: [Dictionary Window] + [Input]
    const dictLen = dictWindow.length;
    const workingBuffer = new Uint8Array(dictLen + input.length);
    workingBuffer.set(dictWindow, 0);
    workingBuffer.set(input, dictLen);

    return {
        workingBuffer,
        inputStartOffset: dictLen,
        dictLen,
        dictId
    };
}
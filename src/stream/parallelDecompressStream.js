/**
 * src/stream/parallelDecompressStream.js
 * Parallel LZ4 Decompression using Worker Pool.
 */

import { LZ4WorkerPool } from "../webWorker/workerPool.js";
import { LZ4FrameParser } from "../frame/frameParser.js";
import { ensureBuffer } from "../shared/lz4Util.js";
import { XXHash32 } from "../xxhash32/xxhash32Stateful.js";

/**
 * Creates a parallel decompression stream.
 * @param {LZ4WorkerPool} [pool] - Optional existing pool.
 * @returns {TransformStream}
 */
export function createParallelDecompressStream(pool = null) {
    if (!pool) {
        pool = new LZ4WorkerPool();
    }

    const parser = new LZ4FrameParser();
    const pending = []; // Array of Promise<Uint8Array>

    // Concurrency Limit logic needed?
    const CONCURRENCY = pool.workers ? pool.workers.length : 4;
    const MAX_PENDING = CONCURRENCY * 2;

    // Global Header State
    let isIndependent = true;
    let hasher = null; // Content Checksum

    return new TransformStream({
        async transform(chunk, controller) {
            const data = ensureBuffer(chunk);

            // Feed Parser
            const events = parser.push(data);

            for (const event of events) {
                switch (event.type) {
                    case 'HEADER':
                        // Check Independence
                        isIndependent = event.data.blockIndependence;
                        if (!isIndependent) {
                            // Fallback?
                            // Since we are already mid-stream, falling back to a serial Decoder is complex 
                            // because we consumed bytes into the Parser state.
                            // Ideal: The Parser *is* the state.
                            // But we don't have a Serial Decoder that takes a Parser instance?
                            // We refactored LZ4Decoder to use Parser!
                            // So yes, we COULD switch to using `LZ4Decoder` logic locally?
                            throw new Error("Parallel Decompression requires Independent Blocks (Stream is Dependent).");
                        }

                        if (event.data.hasContentChecksum) {
                            hasher = new XXHash32(0);
                        }
                        break;

                    case 'BLOCK':
                        if (pending.length >= MAX_PENDING) {
                            const result = await pending.shift();
                            processResult(result, controller, hasher);
                        }

                        const { compressedData, isUncompressed } = event.data;

                        // Dispatch
                        let task;
                        if (isUncompressed) {
                            // Zero-cost "decompression"
                            task = Promise.resolve(compressedData.slice());
                        } else {
                            // uncompressedSize unknown? 
                            // LZ4 block doesn't explicitly header it unless 'contentSize' is globally known?
                            // Wait, Standard LZ4 block size limit is 4MB.
                            // Worker allocates 4MB.
                            // Optimization: If we knew the size, we'd save memory.
                            // But we don't.
                            task = pool.decompressBlock(compressedData);
                        }

                        pending.push(task);
                        break;

                    case 'CONTENT_CHECKSUM':
                        // We must verify this against calculated hash
                        // But we might be pending results.
                        // Must flush first.
                        while (pending.length > 0) {
                            const result = await pending.shift();
                            processResult(result, controller, hasher);
                        }

                        if (hasher) {
                            const actual = hasher.digest();
                            const expected = event.data;
                            if (actual !== expected) {
                                throw new Error("LZ4: Content Checksum Error");
                            }
                        }
                        break;
                }
            }
        },

        async flush(controller) {
            while (pending.length > 0) {
                const result = await pending.shift();
                processResult(result, controller, hasher);
            }
        }
    });
}

function processResult(chunk, controller, hasher) {
    if (hasher) hasher.update(chunk);
    controller.enqueue(chunk);
}

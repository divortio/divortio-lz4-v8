/**
 * src/stream/parallelStream.js
 * Parallel LZ4 Compression using Worker Pool.
 * Strategy: Concatenated Streams of Frames.
 * Each chunk (up to 4MB) is compressed into a standalone LZ4 Frame by a worker.
 */

import { LZ4WorkerPool } from "../webWorker/workerPool.js";
import { ensureBuffer } from "../shared/lz4Util.js";

/**
 * Creates a parallel compression stream.
 * @param {LZ4WorkerPool} [pool] - Optional existing pool. If null, creates one locally.
 * @param {number} [maxBlockSize=4194304] - Size of chunks to send to workers.
 * @returns {TransformStream}
 */
export function createParallelCompressStream(pool = null, maxBlockSize = 4194304) {
    if (!pool) {
        pool = new LZ4WorkerPool();
    }

    // Concurrency Limit
    const CONCURRENCY = pool.workers ? pool.workers.length : 4;
    const MAX_PENDING = CONCURRENCY * 2;

    let buffer = new Uint8Array(0);
    const pending = []; // Array of Promise<Uint8Array> (Ordered)

    return new TransformStream({
        async transform(chunk, controller) {
            const data = ensureBuffer(chunk);

            // Concatenate to buffer
            const combined = new Uint8Array(buffer.length + data.length);
            combined.set(buffer);
            combined.set(data, buffer.length);
            buffer = combined;

            // Dispatch full blocks
            while (buffer.length >= maxBlockSize) {
                // Flow Control: If too many pending, wait for head
                if (pending.length >= MAX_PENDING) {
                    const result = await pending.shift();
                    controller.enqueue(result);
                }

                const block = buffer.slice(0, maxBlockSize);
                buffer = buffer.slice(maxBlockSize);

                // Dispatch Task (Worker produces Full Frame)
                // Note: We MUST clone or transfer 'block' to avoid race conditions with 'buffer' definition?
                // Slice creates a copy (usually), so it's safe.
                const task = pool.compressBlock(block, {
                    maxBlockSize // Pass option
                });

                pending.push(task);
            }
        },

        async flush(controller) {
            // Dispatch remainder
            if (buffer.length > 0) {
                const task = pool.compressBlock(buffer, {
                    maxBlockSize
                });
                pending.push(task);
            }

            // Await ALL pending in order
            while (pending.length > 0) {
                const result = await pending.shift();
                controller.enqueue(result);
            }
        }
    });
}

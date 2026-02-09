/**
 * src/webWorker/workerPool.js
 * * LZ4 Worker Pool
 * * Manages a cluster of Web Workers for parallel processing.
 */

import { LZ4WorkerClient } from './workerClient.js';

/**
 * Detects the number of logical processors.
 * @returns {number}
 */
function getConcurrency() {
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
        return navigator.hardwareConcurrency;
    }
    return 4; // Default fallback
}

export class LZ4WorkerPool {
    /**
     * @param {number} [size] - Number of workers to spawn. Defaults to hardware concurrency.
     */
    constructor(size) {
        this.size = size || getConcurrency();
        this.workers = [];
        this.nextWorkerIndex = 0;
        this.isInitialized = false;
    }

    /**
     * Initializes the worker pool.
     * @private
     */
    _init() {
        if (this.isInitialized) return;

        for (let i = 0; i < this.size; i++) {
            this.workers.push(new LZ4WorkerClient());
        }
        this.isInitialized = true;
    }

    /**
     * Acquires the next worker in the pool (Round-Robin).
     * @returns {LZ4WorkerClient}
     */
    acquire() {
        if (!this.isInitialized) this._init();

        const worker = this.workers[this.nextWorkerIndex];
        this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.size;
        return worker;
    }

    /**
     * Terminates all workers in the pool.
     */
    terminate() {
        this.workers.forEach(w => w.terminate());
        this.workers = [];
        this.isInitialized = false;
    }

    // --- Execution API ---

    /**
     * Compresses a block using the pool.
     * @param {Uint8Array} data 
     * @param {Object} options 
     */
    async compressBlock(data, options) {
        // Simple Round Robin Dispatch
        const worker = this.acquire();
        // Since we are dispatching block-by-block, we use the buffer API.
        return worker.compress(data, options);
    }

    async decompressBlock(data, options) {
        const worker = this.acquire();
        return worker.decompressBlock(data, options);
    }

    // Note: Streaming *through* the pool (splitting a stream into blocks and dispatching)
    // is a higher-level orchestration task handled by `parallelStream.js`, not the pool itself.
    // The pool just provides the workers.
}

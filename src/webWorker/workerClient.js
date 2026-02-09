/**
 * @fileoverview
 * LZ4 Worker Client (Main Thread Orchestrator)
 * ============================================================================
 * "Batteries-Included" wrapper for off-main-thread compression.
 *
 * SUPPORT:
 * - Buffer API: `compress(data)`, `decompress(data)`
 * - Stream API: `compressStream(readable, writable)`, `decompressStream(...)`
 */

/**
 * @fileoverview
 * LZ4 Worker Client (Main Thread Orchestrator)
 * ============================================================================
 * "Batteries-Included" wrapper for off-main-thread compression.
 *
 * SUPPORT:
 * - Buffer API: `compress(data)`, `decompress(data)`
 * - Stream API: `compressStream(readable, writable)`, `decompressStream(...)`
 */

export class LZ4WorkerClient {
    constructor() {
        this.worker = new Worker(new URL('./lz4.worker.js', import.meta.url), {
            type: 'module',
            name: 'LZ4-Worker'
        });

        this.messageIdCounter = 0;
        this.pendingTasks = new Map();

        this.worker.onmessage = (event) => {
            const { id, status, buffer, error } = event.data;
            const taskResolver = this.pendingTasks.get(id);

            if (taskResolver) {
                if (status === 'success') {
                    // For Buffer tasks: resolve with the data
                    // For Stream tasks: resolve undefined (void signal)
                    const result = buffer ? new Uint8Array(buffer) : undefined;
                    taskResolver.resolve(result);
                } else {
                    taskResolver.reject(new Error(error || 'Unknown Worker Error'));
                }
                this.pendingTasks.delete(id);
            }
        };

        this.worker.onerror = (err) => {
            console.error("[LZ4] Worker Critical Error:", err);
        };
    }

    /**
     * Terminate the worker.
     */
    terminate() {
        this.worker.terminate();
    }

    /**
     * Dispatches a Buffer task.
     * @private
     */
    _runBufferTask(task, data, options = {}) {
        const id = ++this.messageIdCounter;

        return new Promise((resolve, reject) => {
            this.pendingTasks.set(id, { resolve, reject });

            const transferBuffer = data.buffer || data;

            this.worker.postMessage({
                id,
                task,
                buffer: transferBuffer,
                options
            });
        });
    }

    /**
     * Dispatches a Stream task.
     * Transfers the streams to the worker.
     * @private
     */
    _runStreamTask(task, readable, writable, options = {}) {
        const id = ++this.messageIdCounter;

        return new Promise((resolve, reject) => {
            this.pendingTasks.set(id, { resolve, reject });

            this.worker.postMessage({
                id,
                task,
                readable,
                writable,
                options
            }, [readable, writable]);
        });
    }

    // --- Public API ---

    compress(data, options) { return this._runBufferTask('compress', data, options); }
    decompress(data, options) { return this._runBufferTask('decompress', data, options); }
    decompressBlock(data, options) { return this._runBufferTask('decompress-block', data, options); }
    compressStream(readable, writable, options) { return this._runStreamTask('stream-compress', readable, writable, options); }
    decompressStream(readable, writable, options) { return this._runStreamTask('stream-decompress', readable, writable, options); }
}

// --- Singleton for Backward Compatibility ---

/** @type {LZ4WorkerClient|null} */
let globalClient = null;

function getGlobalClient() {
    if (!globalClient) {
        globalClient = new LZ4WorkerClient();
    }
    return globalClient;
}

export const LZ4Worker = {
    compress: (data, options) => getGlobalClient().compress(data, options),
    decompress: (data, options) => getGlobalClient().decompress(data, options),
    compressStream: (readable, writable, options) => getGlobalClient().compressStream(readable, writable, options),
    decompressStream: (readable, writable, options) => getGlobalClient().decompressStream(readable, writable, options)
};
/**
 * @fileoverview
 * LZ4 JS - The Universal LZ4 Library (Full Bundle)
 * ============================================================================
 * A high-performance, zero-dependency LZ4 implementation for JavaScript.
 * Supports Node.js, Browsers, Web Workers, and Cloudflare Workers.
 * 
 * Exports:
 * - Named Exports: All core functions (compress, decompress, streams, etc.)
 * - LZ4Worker: Web Worker client (Singleton Wrapper)
 * - LZ4WorkerPool: Web Worker Pool (Class)
 * - LZ4: Legacy "Batteries-Included" Object (Default Export)
 */

import { compressBuffer } from './buffer/bufferCompress.js';
import { decompressBuffer} from './buffer/bufferDecompress.js';
import { compressBlock } from './block/blockCompress.js';
import { decompressBlock  } from './block/blockDecompress.js';
import {createCompressStream} from './stream/streamCompress.js';
import {compressAsync, createAsyncCompressStream} from './stream/streamAsyncCompress.js';
// import { createDecompressStream } from './stream/streamDecompress.js';
// import { createDecompressStream } from './stream/streamDecompress.js';
import { LZ4Worker } from './webWorker/workerClient.js';
import { LZ4WorkerPool } from './webWorker/workerPool.js';
import { createParallelCompressStream } from './stream/parallelStream.js';
import { createParallelDecompressStream } from './stream/parallelDecompressStream.js';
import {createDecompressStream} from "./stream/streamDecompress.js";
import {createAsyncDecompressStream, decompressAsync} from "./lz4-core.js";
import * as Core from "./shared/typeHandling.js";


export const LZ4 = {
    // Synchronous
    compressRaw: compressBlock,
    decompressRaw: decompressBlock,
    compress: compressBuffer,
    decompress: decompressBuffer,

    // Streaming
    createCompressStream: createCompressStream,
    createDecompressStream: createDecompressStream,

    // Async
    compressAsync: compressAsync,
    decompressAsync: decompressAsync,
    createAsyncCompressStream: createAsyncCompressStream,
    createAsyncDecompressStream: createAsyncDecompressStream,

    // Web Worker (Single)
    compressWorker: LZ4Worker.compress,
    decompressWorker: LZ4Worker.decompress,
    compressWorkerStream: LZ4Worker.compressStream,
    decompressWorkerStream: LZ4Worker.decompressStream,

    // Web Worker (Parallel)
    createParallelCompressStream: createParallelCompressStream,
    createParallelDecompressStream: createParallelDecompressStream,
    LZ4WorkerPool: LZ4WorkerPool,

    // Helpers
    compressString: Core.compressString,
    decompressString: Core.decompressString,
    compressObject: Core.compressObject,
    decompressObject: Core.decompressObject,
};

export default {LZ4};
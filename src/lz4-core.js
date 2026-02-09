/**
 * @fileoverview
 * LZ4 Core - The Tree-Shakable Entrypoint
 * ============================================================================
 * Contains pure algorithmic implementations (Buffer, Stream, Async).
 * Excludes environment-specific heavyweights like Web Workers.
 * Use this entrypoint for minimal bundle sizes.
 */

// 1. Synchronous (Blocking)
export { compressBuffer as compress } from './buffer/bufferCompress.js';
export { decompressBuffer as decompress } from './buffer/bufferDecompress.js';
export { compressBlock as compressRaw } from './block/blockCompress.js';
export { decompressBlock as decompressRaw } from './block/blockDecompress.js';

// 2. Streaming (Memory Efficient)
export { createCompressStream } from "./stream/streamCompress.js";
export { createDecompressStream } from "./stream/streamDecompress.js";

// 3. Async (Time-Sliced)
export { compressAsync, createAsyncCompressStream } from "./stream/streamAsyncCompress.js";
export { decompressAsync, createAsyncDecompressStream } from "./stream/streamAsyncDecompress.js";

// 4. Type Handling Helpers
export {
    compressString, decompressString,
    compressObject, decompressObject
} from './shared/typeHandling.js';

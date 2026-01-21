# streamCompress

[🏠 Home](../README.md) > [Stream](README.md) > streamCompress

Source: [`src/stream/streamCompress.js`](../../../../src/stream/streamCompress.js)

## Function: `createCompressStream`
-   **Returns**: `TransformStream<Uint8Array, Uint8Array>`
-   **Logic**: Buffers chunks until `maxBlockSize` is reached, then compresses a block.

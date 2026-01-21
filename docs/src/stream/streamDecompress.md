# streamDecompress

[🏠 Home](../README.md) > [Stream](README.md) > streamDecompress

Source: [`src/stream/streamDecompress.js`](../../../../src/stream/streamDecompress.js)

## Function: `createDecompressStream`
-   **Returns**: `TransformStream<Uint8Array, Uint8Array>`
-   **Logic**: Maintains a buffer of incoming chunks and attempts to parse frames/blocks as data arrives.

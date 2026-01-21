# lz4.worker

[🏠 Home](../README.md) > [WebWorker](README.md) > lz4.worker

Source: [`src/webWorker/lz4.worker.js`](../../../../src/webWorker/lz4.worker.js)

## Functionality
-   **Message Handling**: Listens for `{ task: 'compress' | 'decompress' | 'stream-compress' | ... }`.
-   **Transferables**:
    -   Accepts `ReadableStream` / `WritableStream` via transfer.
    -   Returns `ArrayBuffer` via transfer (Zero-Copy) when possible.

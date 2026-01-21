# workerClient

[🏠 Home](../README.md) > [WebWorker](README.md) > workerClient

Source: [`src/webWorker/workerClient.js`](../../../../src/webWorker/workerClient.js)

## Object: `LZ4Worker`
-   **Pattern**: Singleton Worker instance (lazy-loaded).
-   **Methods**:
    -   `compress(data)`: Promise-based buffer compression.
    -   `compressStream(readable, writable)`: Stream offloading.

# streamAsyncCompress

[🏠 Home](../README.md) > [Stream](README.md) > streamAsyncCompress

Source: [`src/stream/streamAsyncCompress.js`](../../../../src/stream/streamAsyncCompress.js)

## Function: `createAsyncCompressStream`
-   **Concept**: Uses [`TaskScheduler`](scheduler.md) to yield the event loop between block compressions, preventing UI freeze on large streams.

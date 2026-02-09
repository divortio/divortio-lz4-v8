# Todo: streamAsync

[🏠 Home](../src/README.md) > [Stream](../src/stream/README.md) > streamAsyncCompress

Source: [`src/stream/streamAsyncCompress.js`](../../src/stream/streamAsyncCompress.js)

## Architecture
- [ ] **True Async (Web Workers)**:
    -   **Context**: The current implementation uses `TaskScheduler` to yield to the event loop, but execution still happens on the main thread. This prevents UI locking but not CPU contention.
    -   **Task**: Implement a `WorkerPool` based stream that offloads compression to `src/webWorker/`.
- [ ] **Scheduler Location**:
    -   **Context**: `TaskScheduler` is currently in `src/stream/scheduler.js` but is a generic utility.
    -   **Task**: Move to `src/utils/scheduler.js` or `src/shared/scheduler.js`.

## Optimization
- [ ] **Transferable Objects**:
    -   **Context**: If moving to Workers, ensure `ArrayBuffer` transfer is used to avoid copying data between threads.

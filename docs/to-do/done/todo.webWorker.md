# Todo: WebWorker

[🏠 Home](../src/README.md) > [WebWorker](../src/webWorker/README.md)

Source: [`src/webWorker/`](../../src/webWorker/)

## Architecture
- [x] **Concurrency Control**:
    -   **Context**: `workerClient.js` spawns a new Worker or uses a singleton `workerInstance` without concurrency limits? Actually it uses a singleton.
    -   **Issue**: A single worker instance serializes all requests. If `compressStream` is long-running, other `compressBuffer` calls block.
    -   **Task**: Implement a `WorkerPool` (e.g. size 4-8) to handle multiple concurrent requests, possibly using the shared `Scheduler` logic. (Implemented `LZ4WorkerPool`)

## Consolidation
- [ ] **Message Protocol**:
    -   **Context**: Message handling is manual.
    -   **Task**: Standardize message types in `src/shared/workerProtocol.js` if complexity grows.

## Compat
- [x] **Module Worker Fallback**:
    -   **Context**: `new Worker(..., { type: 'module' })`.
    -   **Decision**: Library is **ESM Only**. No fallback required.

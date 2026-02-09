# Consolidate

[🏠 Home](../docs/src/README.md)

Opportunities to deduplicate code.

- [x] **Hash Functions**:
    -   `xxHash32` (src/xxhash32), `hashU32` (src/shared/lz4Util), and `warmHashTable` (src/dictionary) all touch hashing.
    -   **Idea**: Centralize all Knuth hash logic in `src/shared/hashing.js`. (Implemented)

- [x] **Stream/Buffer Encoders**:
    -   `bufferCompress` and `streamCompress` share similar header writing logic.
    -   **Idea**: Use `frame/frameHeader.js` more aggressively to share the exact same byte writing lines. (Implemented)

- [ ] **Scheduler**:
    -   `src/stream/scheduler.js` is a generic concurrency limiter.
    -   **Idea**: Move to `src/utils` or `src/shared` for broader use.
    -   **Use Case**: `workerClient.js` needs a `WorkerPool` which can use this scheduler.

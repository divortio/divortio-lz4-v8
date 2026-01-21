# Todo: streamAsync

[🏠 Home](../src/README.md) > [Stream](../src/stream/README.md) > streamAsyncCompress

Source: [`src/stream/streamAsyncCompress.js`](../../src/stream/streamAsyncCompress.js)

## Architecture
- [ ] **True Async**:
    -   **Context**: Code currently chunks work but still runs synchronously within the slice.
    -   **Task**: Clarify names or move to Worker-based approach for true parallelism.

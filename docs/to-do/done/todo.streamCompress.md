# Todo: streamCompress

[🏠 Home](../src/README.md) > [Stream](../src/stream/README.md) > streamCompress

Source: [`src/stream/streamCompress.js`](../../src/stream/streamCompress.js)

## Spec Gaps
- [x] **Block Checksums**:
    -   **Issue**: `createCompressStream` does not expose `blockChecksum` option.
    -   **Task**: Add argument to `createCompressStream` and pass to `LZ4Encoder`. (Implemented)

## Refactoring / Consolidation
- [x] **Header Generation**:
    -   **Context**: `LZ4Encoder` uses `src/frame/frameHeader.js` to deduplicate logic. (Implemented)

## Optimizations
- [x] **Zero-Alloc Buffer (Ring Buffer/Rope)**:
    -   **Context**: `LZ4Encoder` implements a Ring Buffer strategy.
    -   **Task**: Implement a Ring Buffer or Rope structure to manage the 64KB window + input without reallocation. (Implemented)

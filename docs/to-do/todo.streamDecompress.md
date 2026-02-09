# Todo: streamDecompress

[🏠 Home](../src/README.md) > [Stream](../src/stream/README.md) > streamDecompress

Source: [`src/stream/streamDecompress.js`](../../src/stream/streamDecompress.js)

## Spec Gaps
- [x] **Block Checksums**:
    -   **Issue**: `createDecompressStream` passes `verifyChecksum`.
    -   **Task**: Verify `LZ4Decoder` correctly interprets this flag for Block Checksums. (Implemented)

## Opportunities
- [x] **Consolidated Decoding**:
    -   **Idea**: Ensure `LZ4Decoder` shares frame parsing logic with `bufferDecompress` if possible.
    -   **Resolution**: Extracted `src/frame/frameParser.js` for Stream/Parallel usage. `bufferDecompress` retains optimized loop for speed.

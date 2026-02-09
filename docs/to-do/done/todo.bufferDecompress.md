# Todo: bufferDecompress

[🏠 Home](../src/README.md) > [Buffer](../src/buffer/README.md) > bufferDecompress

Source: [`src/buffer/bufferDecompress.js`](../../src/buffer/bufferDecompress.js)

## Spec Gaps
- [x] **Skippable Frames**:
    -   **Context**: Spec allows frames starting with `0x184D2A50` to `0x184D2A5F`.
    -   **Issue**: `bufferDecompress.js` accepts only `0x184D2204`.
    -   **Task**: Implement loop to check for Skippable Magic Numbers. (Implemented)
- [x] **Block Checksums**:
    -   **Issue**: Skips bytes but does not verify.
    -   **Task**: Add verification logic. (Implemented: Verify if `verifyChecksum` is true)

## Optimizations
- [ ] **Pre-Allocated Workspace Sizing**:
    -   **Context**: `FALLBACK_WORKSPACE` is fixed at 4MB.
    -   **Task**: Consider dynamic sizing for constrained environments.

# bufferDecompress

[🏠 Home](../README.md) > [Buffer](README.md) > bufferDecompress

Source: [`src/buffer/bufferDecompress.js`](../../../../src/buffer/bufferDecompress.js)

## Description
High-level synchronous function to decompress a complete LZ4 Frame.

## Function: `decompressBuffer`
### Strategies
1.  **Direct Write (Zero-Copy)**:
    -   Triggers if `Content Size` is present in the Frame Header.
    -   Allocates the final `Uint8Array` once.
    -   Decompresses blocks directly into their final positions.
2.  **Chunked (Fallback)**:
    -   Triggers if `Content Size` is missing.
    -   Decompresses blocks into a shared `FALLBACK_WORKSPACE`.
    -   Accumulates chunks in an array and merges them at the end.

### Spec Compliance
-   **Supported**: Frame Header, Content Size, Content Checksum (Verify), Dictionary ID.
-   **Ignored**: Block Checksums (Parsed but not verified).
-   **Unsupported**: Skippable Frames (will throw Error), Legacy Frames.

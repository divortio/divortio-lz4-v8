# bufferCompress

[🏠 Home](../README.md) > [Buffer](README.md) > bufferCompress

Source: [`src/buffer/bufferCompress.js`](../../../../src/buffer/bufferCompress.js)

## Description
High-level synchronous function to generate a complete LZ4 Frame from a buffer.

## Function: `compressBuffer`
### Signature
```javascript
export function compressBuffer(input, dictionary, maxBlockSize, blockIndependence, contentChecksum, addContentSize, outputBuffer)
```
### Optimizations
-   **Global Hash Table**: Uses a module-level `Int32Array` (16K entries) to avoid allocation on every call.
    -   *Note*: This makes the function non-reentrant (safe in single-threaded JS, potentially unsafe if re-entered recursively or via specialized worker setups sharing scope).
-   **Zero Allocation Output**: Can write to a user-provided `outputBuffer`.
-   **Fallback Allocation**: Calculates "Worst Case" size (Input + 0.4% + Header) to ensure safe write if no buffer provided.

### Spec Compliance
-   **Supported**: Frame Header, Content Size, Content Checksum, Dictionary ID.
-   **Missing**: Block Checksums (not implemented).

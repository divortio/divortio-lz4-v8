# blockDecompress

[🏠 Home](../README.md) > [Block](README.md) > blockDecompress

Source: [`src/block/blockDecompress.js`](../../../../src/block/blockDecompress.js)

## Description
The core LZ4 block decompression kernel. Designed for high throughput using "unsafe" memory patterns (simulated).

## Function: `decompressBlock`

### Signature
```javascript
export function decompressBlock(input, inputOffset, inputSize, output, outputOffset, dictionary)
```

### Logic
1.  **Token**: Reads the token byte.
2.  **Literals**:
    -   Parses length (handling >= 15 extension).
    -   **Double Copy Optimization**: For medium lengths (8-32 bytes), unrolls the copy loop and uses an overlapping 8-byte write for the tail. This avoids branch mispredictions on the last few bytes.
3.  **Offset**: Reads 2-byte LE offset. Valides `offset !== 0`.
4.  **Match**:
    -   Parses length.
    -   **Dictionary Handling**: If offset points prior to `outputOffset`, retrieves data from `dictionary`.
    -   **Overlap Handling**:
        -   RLE (`offset === 1`): Uses `fill`.
        -   Non-overlap: Uses `copyWithin`.
        -   Overlap: Manual byte-by-byte copy (or 8-byte unrolled loop).

### Key Features
-   **Branchless Tails**: The "Double Copy" strategy writes 8 bytes even if only 1 is needed for the tail, relying on the fact that it overlaps with correct data already written.
-   **Dictionary Support**: Seamlessly handles back-references that cross into the history window.

# blockCompress

[🏠 Home](../README.md) > [Block](README.md) > blockCompress

Source: [`src/block/blockCompress.js`](../../../../src/block/blockCompress.js)

## Description
The core LZ4 block compression kernel. It processes the raw input data and emits compressed sequences (Token + Literals + Offset + Match Length).

## Function: `compressBlock`

### Signature
```javascript
export function compressBlock(src, output, srcStart, srcLen, hashTable, outputOffset)
```

### Logic
1.  **Preamble**: Initializes scan pointers and bounds (`mflimit`, `matchLimit`).
2.  **Main Loop**:
    -   **Hashing**: Reads 4 bytes, calculates xxHash-style multiplicative hash.
    -   **Lookup**: Checks `hashTable`.
    -   **Skip Strategy**: If no match, increments step size dynamically to skip non-compressible regions faster.
    -   **Match Verification**: Checks if match is within 64KB window (`(sIndex - mIndex) >>> 16`).
    -   **Sequence Emission**:
        -   Calls [`encodeLiterals`](blockLiterals.md).
        -   Calls [`encodeMatch`](blockMatch.md).
3.  **Termination**: Writes the final literal sequence (last 5 bytes or more).

### Optimizations
-   **SMI Coercion**: Uses `| 0` everywhere to force V8 to use 32-bit integer registers.
-   **Inlining**: Hashes are calculated inline to avoid function overhead.
-   **Search Skip**: Increases search stride when matches are not found.

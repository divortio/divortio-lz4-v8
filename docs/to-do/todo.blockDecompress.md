# Todo: blockDecompress

[🏠 Home](../src/README.md) > [Block](../src/block/README.md) > blockDecompress

Source: [`src/block/blockDecompress.js`](../../src/block/blockDecompress.js)

## Verification
- [ ] **Fuzz Testing**:
    -   **Context**: The "Double Copy" optimizations rely on strict buffer bounds.
    -   **Task**: Run a fuzzer against `decompressBlock` with malformed inputs to ensure the `tailOut` logic never writes out of bounds.

## Optimizations
- [ ] **Uint32 Reads**:
    -   **Context**: `blockDecompress.js` reads offsets and match lengths byte-by-byte.
    -   **Task**: In the hot loop (Token reading + Offset reading), try reading 32 bits at a time (if aligned) to fetch Token+Offset in one go.

# blockLiterals

[🏠 Home](../README.md) > [Block](README.md) > blockLiterals

Source: [`src/block/blockLiterals.js`](../../../../src/block/blockLiterals.js)

## Description
Helper module to encode Literal sequences in the LZ4 format.

## Function: `encodeLiterals`
-   **Role**: Writes the High Nibble of the Token and copies the literal bytes.
-   **Output**: Updates `output[tokenPos]`.
-   **Optimizations**: Uses the same "Double Copy" strategy as the decompressor for lengths >= 8 bytes.

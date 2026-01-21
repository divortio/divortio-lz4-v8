# blockMatch

[🏠 Home](../README.md) > [Block](README.md) > blockMatch

Source: [`src/block/blockMatch.js`](../../../../src/block/blockMatch.js)

## Description
Helper module to encode Match sequences in the LZ4 format.

## Function: `encodeMatch`
-   **Role**: Writes the Match Offset (2 bytes LE) and the Low Nibble of the Token.
-   **Input**: `matchLen` (raw length).
-   **Logic**: Subtracts `MIN_MATCH` (4) from length before encoding.
-   **Output**: Uses bitwise OR (`|=`) to update the Token byte (which already contains the literal length).

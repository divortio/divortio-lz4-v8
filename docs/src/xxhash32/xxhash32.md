# xxHash32

[🏠 Home](../README.md) > [xxHash32](README.md) > xxHash32

Source: [`src/xxhash32/xxhash32.js`](../../../../src/xxhash32/xxhash32.js)

## Function: `xxHash32`
-   **Signature**: `(input, seed, offset, length) => number`
-   **Optimizations**: 
    -   Loops unrolled manually.
    -   Uses `Math.imul` for correct 32-bit overflow behavior.

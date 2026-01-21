# LZ4Dictionary

[🏠 Home](../README.md) > [Dictionary](README.md) > LZ4Dictionary

Source: [`src/dictionary/LZ4Dictionary.js`](../../../../src/dictionary/LZ4Dictionary.js)

## Class: `LZ4Dictionary`
-   **Purpose**: Encapsulates a dictionary buffer and its pre-calculated hash table.
-   **Optimization**: Pre-calculating the hash table avoids rebuilding it for every compression operation (O(1) setup vs O(N)).

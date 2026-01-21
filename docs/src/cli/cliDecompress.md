# cliDecompress

[🏠 Home](../README.md) > [CLI](README.md) > cliDecompress

Source: [`src/cli/cliDecompress.js`](../../../../src/cli/cliDecompress.js)

## Description
The "Controller" for the **decompress** command.

## Function: `run`
-   **Flow**:
    1.  Validates files.
    2.  Loads Dictionary (if provided).
    3.  Initializes [`CliDecompressResults`](cliDecompressResults.md).
    4.  **Reads** compressed file.
    5.  **Decompresses** using `LZ4.decompress`.
    6.  **Writes** restored file.
    7.  Reports results.

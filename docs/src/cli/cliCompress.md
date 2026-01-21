# cliCompress

[🏠 Home](../README.md) > [CLI](README.md) > cliCompress

Source: [`src/cli/cliCompress.js`](../../../../src/cli/cliCompress.js)

## Description
The "Controller" for the **compress** command.

## Function: `run`
-   **Flow**:
    1.  Validates files (Input exists? Output overwrite?).
    2.  Loads Dictionary (if specified).
    3.  Initializes [`CliCompressResults`](cliCompressResults.md) collector.
    4.  **Reads** input file synchronously.
    5.  **Compresses** using `LZ4.compress` (Sync).
    6.  **Writes** output file synchronously.
    7.  Reports results (Console text or JSON).
    8.  Handles cleanup (deleting input if `--rm`).

# cliLog

[🏠 Home](../README.md) > [CLI](README.md) > cliLog

Source: [`src/cli/cliLog.js`](../../../../src/cli/cliLog.js)

## Description
Handles persistent logging of CLI operations to disk.

## Function: `writeLog`
-   **Features**:
    -   Supports `JSON` (NDJSON), `CSV`, and `TSV` formats.
    -   Auto-generates filenames if not provided.
    -   Appends to existing files atomically (synchronous `appendFileSync`).
    -   Flattens nested JSON objects for tabular (CSV/TSV) output.

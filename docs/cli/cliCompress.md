# `cliCompress` Module

Implementation of the compression logic for the CLI.

**Source**: [src/cli/cliCompress.js](../../src/cli/cliCompress.js)

## Logic flow
1.  **Validation**: Checks input file existence and output overwrite conditions.
2.  **Dictionary**: Loads dictionary file if provided (`-D`).
3.  **Read**: Reads input file into a buffer (`fs.readFileSync`).
4.  **Compress**: Calls `LZ4.compress` with options:
    *   Block Size
    *   Independence
    *   Checksums
5.  **Write**: Writes compressed buffer to output file.
6.  **Cleanup**: Deletes input if `--rm` was specified.

## Reporting
*   **Verbose**: Detailed text output with performance metrics. (See [cliVerbose.md](cliVerbose.md))
*   **JSON**: Machine-readable JSON output. (See [cliJSON.md](cliJSON.md))

## Source
See [src/cli/cliCompress.js](../../src/cli/cliCompress.js).

## See Also
*   [cliDecompress.md](cliDecompress.md) - Decompression logic.
*   [cliArgs.md](cliArgs.md) - Full argument references.

# `cliDecompress` Module

Implementation of the decompression logic for the CLI.

**Source**: [src/cli/cliDecompress.js](../../src/cli/cliDecompress.js)

## Logic flow
1.  **Validation**: Checks input/output.
2.  **Dictionary**: Loads dictionary file if provided (`-D`).
3.  **Read**: Reads input file into a buffer.
4.  **Decompress**: Calls `LZ4.decompress`.
    *   Validates Magic Number, Version, Checksums automatically.
5.  **Write**: Writes decompressed buffer to output file.
6.  **Cleanup**: Deletes input if `--rm` was selected.

## Reporting
*   **Verbose**: Detailed text output with performance metrics. (See [cliVerbose.md](cliVerbose.md))
*   **JSON**: Machine-readable JSON output. (See [cliJSON.md](cliJSON.md))

## Source
See [src/cli/cliDecompress.js](../../src/cli/cliDecompress.js).

## See Also
*   [cliCompress.md](cliCompress.md) - Compression logic.
*   [cliArgs.md](cliArgs.md) - Full argument references.

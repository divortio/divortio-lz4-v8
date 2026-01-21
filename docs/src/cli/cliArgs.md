# cliArgs

[🏠 Home](../README.md) > [CLI](README.md) > cliArgs

Source: [`src/cli/cliArgs.js`](../../../../src/cli/cliArgs.js)

## Description
Parses raw command-line arguments into a structure consumable by [`CLIConfig`](cliConfig.md).

## Function: `parseArgs`
-   **Input**: `string[]` (defaults to `process.argv.slice(2)`)
-   **Output**: [`CLIConfig`](cliConfig.md)
-   **Logic**:
    -   Detects command (`compress` vs `decompress` vs `help`).
    -   Iterates through flags (`-o`, `-f`, `-B`, etc.).
    -   Handles positional arguments (input file).

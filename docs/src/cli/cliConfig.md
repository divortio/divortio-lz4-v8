# cliConfig

[🏠 Home](../README.md) > [CLI](README.md) > cliConfig

Source: [`src/cli/cliConfig.js`](../../../../src/cli/cliConfig.js)

## Description
State container for CLI options with validation and default resolution logic.

## Class: `CLIConfig`
-   **Properties**: Maps 1:1 with CLI arguments (`input`, `output`, `blockSize`, etc.).
-   **Methods**:
    -   `_resolveDefaults()`: Auto-generates output filenames (e.g. `file.txt` -> `file.txt.lz4`).
    -   `validate()`: Ensures required fields (like input) are present.

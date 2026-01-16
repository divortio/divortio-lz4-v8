# `cliHelp` Module (LZ4 CLI)

Provides rich, context-aware help messages for the LZ4-Divortio CLI.

**Source**: [src/cli/cliHelp.js](../../src/cli/cliHelp.js)

## Usage
* `node src/lz4CLI.js --help`: Global help.
* `node src/lz4CLI.js compress --help`: Compression-specific help.
* `node src/lz4CLI.js decompress --help`: Decompression-specific help.

## Features
* **Detailed Descriptions**: Explains what each command does and when to use specific flags.
* **Argument Documentation**: Lists all supported arguments and their defaults (e.g., Block Size defaults to 4MB).
* **Examples**: Provides copy-pasteable examples for common workflows.

## Source
See [src/cli/cliHelp.js](../../src/cli/cliHelp.js).

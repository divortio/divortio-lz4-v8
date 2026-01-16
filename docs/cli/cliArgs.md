# CLI Arguments (`lz4-divortio` CLI)

Handling of command-line arguments for the `lz4CLI.js` tool.

**Source**: [src/cli/cliArgs.js](../../src/cli/cliArgs.js)

## Usage
```bash
node src/lz4CLI.js <command> [options] <file>
```

## Commands
* `compress`: Compress a file. (See [cliCompress.md](cliCompress.md))
* `decompress`: Decompress a file (Alias: `-d`). (See [cliDecompress.md](cliDecompress.md))

## Global Options
* `-o, --output <file>`: Specify output filename.
    * Default for compress: `<input>.lz4`
    * Default for decompress: `<input_without_lz4_ext>` or `<input>.out`
* `-f, --force`: Force overwrite of output file.
* `-k, --keep`: Keep input file (default: true). This is the default behavior, but the flag maintains compatibility with scripts expecting explicit instructions.
* `--rm`: Delete input file after successful operation (mimics `gzip` behavior).
* `-v, --verbose`: Enable verbose output. (See [cliVerbose.md](cliVerbose.md))
* `--json`: Enable JSON output. (See [cliJSON.md](cliJSON.md))
* `--log [file]`: Enable logging to file. (See [cliLog.md](cliLog.md))
* `--log-format <fmt>`: Log format (json, csv, tsv). Default: json.
* `-h, --help`: Show help message.

See also [cliHelp.js](../../src/cli/cliHelp.js) for the interactive help implementation.

## Compression Options
* `-B, --block-size <n>`: Set maximum block size.
    * Values: `64k`, `256k`, `1m`, `4m` (or bytes).
    * Default: `4MB`.
* `-D, --dictionary <file>`: Load an external dictionary file.
* `-i, --independent-blocks`: Enable independent blocks (improves random access, slightly lower ratio).
* `--content-checksum`: Enable full content checksum verification.
* `--no-frame-content-size`: Do not store original content size in header.

## Decompression Options
* `-D, --dictionary <file>`: Load dictionary for decompression (required if compressed with one, usually).
* `--verify-checksum`: Enable validation of content checksum (if present). Default: false (fastest).

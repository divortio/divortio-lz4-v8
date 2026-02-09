# Benchmark CLI Arguments

Documentation for the command-line arguments used by the `benchmark/bench.js` tool.

**Source**: [src/cli/cliArgs.js](../../src/cli/cliArgs.js)

## Commands

*   `compress`: Run compression benchmarks. (See [cliCompress.md](cliCompress.md))
*   `decompress`: Run decompression benchmarks. (See [cliDecompress.md](cliDecompress.md))
*   `roundtrip`: Run roundtrip (compress -> decompress) benchmarks. (See [cliRoundtrip.md](cliRoundtrip.md))
*   `indexCorpus`: Build or download corpora. (See [cliBuildCorpus.md](cliBuildCorpus.md))
*   `listCorpora`: List available resources. (See [cliList.md](cliList.md))
*   `libs`: List available libraries. (See [cliListLibs.md](cliListLibs.md))
*   `corpus`: List available corpora. (See [cliListCorpus.md](cliListCorpus.md))
*   `profile`: Run profile operations. (See [cliProfile.md](cliProfile.md))

## Global Options

### Input/Output
*   `-i, --input <path>`: Specify input file(s). Can be repeated.
*   `-c, --corpus <name>`: Specify corpus name (e.g., `silesia`). Can be repeated.
*   `-o, --output <file/dir>`: Specify output report file or directory.
*   `-f, --format <fmt>`: Report format (`md`, `json`, `csv`, `tsv`). Default: `md`.
*   `--dir, --directory`: Directory for output (if not using `-o`). (Used as diagnostic dir for `profile`).

### Execution Control
*   `-l, --library <name>`: Specify library to benchmark. Can be repeated.
*   `-s, --samples <n>`: Number of benchmark samples per test (default: 5).
*   `-w, --warmup <n>`: Number of warmup runs (default: 2).
*   `--dry-listLibs`: Simulate execution without running heavy tasks.

### Logging
*   `--log [file]`: Enable streaming log to file. (Used as V8 logfile for `profile`).
*   `--log-format <fmt>`: Log format (`json`, `csv`, `tsv`). Default: `json`.

### Filtering
*   `--env, --environment <name>`: Filter libraries by environment (e.g., `node`, `browser`).
*   `--lang, --language <name>`: Filter libraries by language (e.g., `js`, `wasm`).

### Build Options
*   `--name <name>`: Specify corpus name for `indexCorpus` command.

### Misc
*   `-h, --help`: Show help message.
*   `--no-header`: Suppress header in CSV/TSV output (useful for appending).
*   `--append`: Append to existing report file.

## See Also
*   [cliHelp.md](cliHelp.md)

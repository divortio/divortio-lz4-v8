# Benchmark CLI Documentation

Welcome to the documentation for the `lz4-divortio` Benchmark CLI. This tool is designed to rigorously test and compare compression libraries across Node.js and V8/WASM environments.

## Index
*   [Quick Start](#quick-start)
*   [Core Features](#core-features)
*   [Documentation Index](#documentation-index)
    *   [Overviews and References](#overviews-and-references)
    *   [Commands](#commands)
    *   [Reporting & Formats](#reporting--formats)
*   [Directory Structure](#directory-structure)

## Quick Start

Run a simple compression benchmark using the `lz4` library against a local file:

```bash
node benchmark/bench.js compress -i my_data.bin -l lz4
```

Or benchmark against a standard corpus (automatically downloaded):

```bash
node benchmark/bench.js compress -c silesia -l lz4
```

## Core Features

*   **Multi-Library Support**: Benchmark pure JavaScript, WASM, and Native bindings side-by-side.
*   **Corpus Management**: Built-in support for downloading and managing standard corpora like **Silesia** and **lz_flex**.
*   **Robust Reporting**:
    *   **Markdown**: Human-readable summary tables (Default).
    *   **JSON**: Machine-readable metrics for CI/CD.
    *   **CSV/TSV**: Detailed logs for analysis.
    *   **Logging**: Stream results to file in real-time.
*   **Flexible Inputs**: Mix and match local files and corpus files in a single run.

## Documentation Index

### Overviews and References
*   [cliCommands.md](cliCommands.md) - **Start Here**: Comprehensive guide to all commands and their usage.
*   [cliArgs.md](cliArgs.md) - Full reference of all command-line arguments.
*   [cliHelp.md](cliHelp.md) - Using the interactive help system.

### Commands
*   [cliCompress.md](cliCompress.md) - Compression benchmarking logic.
*   [cliDecompress.md](cliDecompress.md) - Decompression benchmarking logic.
*   [cliRoundtrip.md](cliRoundtrip.md) - Roundtrip (Compress -> Decompress) verification.
*   [cliBuildCorpus.md](cliBuildCorpus.md) - Managing and building corpora.
*   [cliList.md](cliList.md) - Listing commands.
*   [cliListLibs.md](cliListLibs.md) - Listing available libraries.
*   [cliListCorpus.md](cliListCorpus.md) - Listing available corpus files.

### Library Features
*   [cliLibs.md](cliLibs.md) - **Overview**: Library selection and aliasing.

### Corpus Features
*   [cliCorpus.md](cliCorpus.md) - **Overview**: How to target corpus data.
*   [cliCorpusFiles.md](cliCorpusFiles.md) - Sequential processing (`-c silesia`).
*   [cliCorpusFile.md](cliCorpusFile.md) - Single file targeting (`-c silesia.dickens`).
*   [cliCorpusTar.md](cliCorpusTar.md) - **Concatenated/Tar**: Throughput testing (`-c silesia.tar`).
*   [cliBuildCorpusTar.md](cliBuildCorpusTar.md) - **Technical**: Out-of-process tar generation.

### Reporting & Formats
*   [cliLog.md](cliLog.md) - File logging (`--log`).
*   [cliJSON.md](cliJSON.md) - JSON output format.
*   [cliDSV.md](cliDSV.md) - CSV/TSV output format.
*   [cliMarkdown.md](cliMarkdown.md) - Markdown reporting.

## Directory Structure

*   `benchmark/bench.js`: The main entry point CLI script.
*   `benchmark/src/cli/`: Source code for CLI commands.
*   `benchmark/.cache/corpus/`: Storage location for downloaded corpora.

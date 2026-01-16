# Benchmark CLI Commands

Comprehensive reference for all commands available in the `benchmark/bench.js` CLI.

## Index
*   [Primary Commands](#primary-commands)
    *   [`compress`](#compress)
    *   [`decompress`](#decompress)
    *   [`roundtrip`](#roundtrip)
    *   [`indexCorpus`](#buildcorpus)
*   [Listing Resources](#listing-resources)
    *   [`list`](#list)
    *   [`libs`](#libs-or-libraries)
    *   [`corpus`](#corpus-or-corpora)
*   [Common Arguments](#common-arguments)
*   [Feature References](#feature-references)

## Primary Commands

### `compress`
Run compression benchmarks on specified files or corpora.

**Usage:**
```bash
node benchmark/bench.js compress [options]
```

**Examples:**

*   **Basic**: Compress a file with a specific library.
    ```bash
    node benchmark/bench.js compress -i input.dat -l lz4-js
    ```
*   **Corpus**: Benchmark against the Silesia corpus.
    ```bash
    node benchmark/bench.js compress -c silesia -l lz4-js -l lz4
    ```
*   **Reporting**: Save results to a CSV log file. (See [cliLog.md](cliLog.md))
    ```bash
    node benchmark/bench.js compress -c silesia -l lz4 --log results.csv --log-format csv
    ```

**Documentation**: [cliCompress.md](cliCompress.md)

---

### `decompress`
Run decompression benchmarks. Typically requires compressed input, but can auto-compress logic if benchmark handles roundtrip preparation (currently specialized).

**Usage:**
```bash
node benchmark/bench.js decompress [options]
```

**Examples:**

*   **Basic**: Decompress a file.
    ```bash
    node benchmark/bench.js decompress -i compressed.lz4 -l lz4-js
    ```
*   **JSON Output**: Output metrics as JSON for CI/CD. (See [cliJSON.md](cliJSON.md))
    ```bash
    node benchmark/bench.js decompress -i data.lz4 -l lz4 --format json
    ```

**Documentation**: [cliDecompress.md](cliDecompress.md)

---

### `roundtrip`
Run compression followed immediately by decompression on the regular output. Verifies correctness and measures combined throughput.

**Usage:**
```bash
node benchmark/bench.js roundtrip [options]
```

**Examples:**

*   **Verify**: Ensure library correctness.
    ```bash
    node benchmark/bench.js roundtrip -i input.dat -l lz4-js
    ```

**Documentation**: [cliRoundtrip.md](cliRoundtrip.md)

---

### `indexCorpus`
Manage the benchmark corpus files. Downloads standard corpora (Silesia, lz_flex) or indexes user-provided files.

**Usage:**
```bash
node benchmark/bench.js indexCorpus [--name <name>]
```

**Examples:**

*   **Download Silesia**:
    ```bash
    node benchmark/bench.js indexCorpus --name silesia
    ```
*   **Download lz_flex**:
    ```bash
    node benchmark/bench.js indexCorpus --name lz_flex
    ```
*   **Rebuild Index**: (Scans `.cache/corpus` and updates `corpus.json`)
    ```bash
    node benchmark/bench.js indexCorpus
    ```

**Documentation**: [cliBuildCorpus.md](cliBuildCorpus.md)

---

## Listing Resources

### `list`
General list command. Shows available commands.

**Documentation**: [cliList.md](cliList.md)

### `libs` (or `libraries`)
List all registered compression libraries available for benchmarking.

**Usage:**
```bash
node benchmark/bench.js libs [filter]
```

**Documentation**: [cliListLibs.md](cliListLibs.md)

### `corpus` (or `corpora`)
List all available files in the registered corpora.

**Usage:**
```bash
node benchmark/bench.js corpus [filter]
```

**Documentation**: [cliListCorpus.md](cliListCorpus.md)

---

## Common Arguments

*   **Inputs**: `-i <file>`, `-c <corpus>`
*   **Libraries**: `-l <lib>`
*   **Execution**: `-s <samples>`, `-w <warmup>`, `--dry-run`
*   **Reporting**: `--log`, `--log-format`, `-f <format>`, `-o <output>`

See [cliArgs.md](cliArgs.md) for the full argument reference.

## Feature References

*   **Logging**: [cliLog.md](cliLog.md) - Learn about streaming logs to files.
*   **JSON Report**: [cliJSON.md](cliJSON.md) - Learn about machine-readable output.
*   **DSV Report**: [cliDSV.md](cliDSV.md) - Learn about CSV/TSV generation.
*   **Markdown Report**: [cliMarkdown.md](cliMarkdown.md) - Learn about the default readable report.

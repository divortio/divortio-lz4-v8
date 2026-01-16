# CLI Help

The benchmark CLI provides extensive options for running benchmarks and generating reports in various formats.

## General Usage

```bash
node benchmark/bench.js <command> [options]
```

## Commands

-   **compress**: Run compression benchmarks.
-   **decompress**: Run decompression benchmarks.
-   **roundtrip**: Run compress -> decompress cycle benchmarks.

## Options

### Configuration
-   `-l, --library <name>`: **Required**. Library to test.
-   `-i, --input <path>`: Input file.
-   `-c, --corpus <name>`: Standardized corpus name (e.g., `silesia`).
-   `-s, --samples <n>`: Number of iterations (Default: 5).
-   `-w, --warmup <n>`: Number of warmup iterations (Default: 2).

### Reporting
-   `-f, --format <type>`: Output format(s). `md` (markdown), `json`, `csv`, `tsv`.
-   `-o, --output <path>`: Output destination. Can be a directory (to save auto-generated files in) or a filename (to save specific file). The file extension can infer the format.
-   `--dir <path>`: Output directory override. Supercedes directory derived from `--output`.
-   `--prefix <str>`: String to prepend to auto-generated filenames.
-   `--append`: Append to existing files (useful for CSV/JSON logs).
-   `--no-header`: Do not write headers (useful for appending CSVs).

## Examples

**Basic run:**
```bash
node benchmark/bench.js compress -l v8.js.lz4Divortio -c silesia
```

**Save JSON output:**
```bash
node benchmark/bench.js roundtrip -l pako -i data.txt -o results/raw_data.json
```

**Append to CSV log:**
```bash
node benchmark/bench.js compress ... -f csv --output history.csv --append --no-header
```

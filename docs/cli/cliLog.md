# CLI File Logging (`--log`)

The `--log` feature allows you to save detailed execution metrics to a file for later analysis. It supports multiple formats (JSON, CSV, TSV) and automatically handles file creation and appending.

**Source**: [src/cli/cliLog.js](../../src/cli/cliLog.js)

## Usage

```bash
# Log to default filename (json format)
node src/lz4CLI.js compress file.bin --log

# Log to specific file
node src/lz4CLI.js compress file.bin --log my_benchmark.json

# Log to CSV
node src/lz4CLI.js compress file.bin --log my_benchmark.csv --log-format csv
```

## Features

### Automatic Log File Generation
If no filename is provided, a log file is automatically generated in the current directory using the pattern:
`log_{command}_{timestampMs}.{ext}`
Example: `log_compress_1705192000123.json`

### File Handling
*   **New File**: If the log file does not exist, it is created. For CSV/TSV formats, a header row is automatically written.
*   **Existing File**: If the log file exists, the new entry is appended to the end.

### Formats (`--log-format`)
*   `json` (Default): Appends a single line containing the full JSON metric object (same as `--json` output).
*   `csv`: Appends a comma-separated value line. Nested fields are flattened (e.g., `input.size` -> `input.size`).
*   `tsv`: Appends a tab-separated value line.

### Console Output
When logging is enabled, valid log operations are confirmed in the console:
```text
Log: /abs/path/to/my_benchmark.csv (2.4 KB)
```
Note: Enabling `--log` automatically enables `--verbose` console output (unless `--json` is also specified, in which case JSON is printed to stdout).

## See Also
*   [cliJSON.md](cliJSON.md) - JSON output format details.
*   [cliArgs.md](cliArgs.md) - Full argument reference.

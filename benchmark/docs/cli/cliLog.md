# Benchmark CLI Logging (`--log`)

The `--log` feature allows you to stream benchmark results to a log file. This is useful for tracking performance over time or performing longitudinal analysis.

## Usage

```bash
# Log to default filename (json format)
node bench.js compress --log -i data.bin -l lz4

# Log to specific file
node bench.js compress --log benchmark_history.csv --log-format csv -i data.bin -l lz4
```

## Features

### Smart Appending
*   **JSON**: Appends line-delimited JSON objects (NDJSON). Each line represents a single benchmark configuration result.
*   **CSV/TSV**: Appends rows. Automatically writes the header row only if the file is new.

### Automatic Log File Generation
If no filename is provided to `--log`, a file is generated: `log_{command}_{timestamp}.{ext}`.

### Console Feedback
```text
Log: /abs/path/to/benchmark_history.csv (10.5 KB)
```

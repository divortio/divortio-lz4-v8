# CLI Reporting: CSV & TSV (DSV)

The CLI supports Delimiter-Separated Values (DSV) output, specifically Comma-Separated Values (CSV) and Tab-Separated Values (TSV). This is useful for importing results into spreadsheets or databases.

## Usage

Use the `-f` or `--format` flag to specify `csv` or `tsv`. You can generate multiple formats in one run.

```bash
node benchmark/bench.js compress ... -f csv
node benchmark/bench.js compress ... -f md,tsv
```

## Output

Reports are saved to `benchmark/results/` with a name pattern: `report_<timestamp>_<type>.<ext>`.

For each run, two files are generated per format:

1.  **Detailed Report** (`..._detailed.csv`):
    -   One row per sample (or file/library pair).
    -   High-precision metrics.
    -   Columns: Timestamp, Filename, Library, InputSize, OutputSize, Duration, Ratio, Throughput.

2.  **Summary Report** (`..._summary.csv`):
    -   Aggregated results (e.g. Median Throughput).
    -   Columns: Library, Corpus, File, Aggregated Metrics.

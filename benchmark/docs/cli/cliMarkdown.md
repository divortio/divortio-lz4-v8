# CLI Reporting: Markdown

The default reporting format for the benchmark CLI is Markdown. This generates a comprehensive, human-readable report suitable for GitHub or documentation.

## Usage

Use the `-f` or `--format` flag to explicitly specify `md` (though it is the default).

```bash
node benchmark/bench.js compress ... -f md
```

## Output

The report is saved to `benchmark/results/` with a name pattern: `report_<type>_<timestamp>.md`.

### Content
- **Header**: Report Metadata (Date, etc.)
- **Command**: The CLI command used to generate the report.
- **System Info**: Host CPU, Memory, OS details.
- **Inputs**: List of files processed.
- **Libraries**: List of libraries tested.
- **Summary**: High-level stats (Fastest/Slowest file, Total Throughput) grouped by Library.
- **Leaderboard**: Aggregated metrics ranked by throughput.
- **Charts**: Mermaid diagrams visualizing throughput.
- **Detailed Results**: Row-by-row performance metrics.

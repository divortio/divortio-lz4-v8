# CLI JSON Output

The Benchmark CLI supports exporting results to JSON for programmatic analysis and reporting.

## Usage

Use the `--output` (or `-o`) argument to specify a destination file. If the file ends in `.jsonl` or if `--append` is used with an existing file, the CLI will append using JSON Lines mode.

```bash
# Standard Output (Overwrite)
node benchCompressCLI.js -l lz4-divortio -i data.bin -o results.json

# Append Mode (JSON Lines)
# Useful for collecting multiple runs in a single file without parsing the whole file.
node benchCompressCLI.js -l lz4-divortio -i data.bin -o results.jsonl --append
```

## Structure

The JSON output is wrapped in a `BenchResults` object containing:

- **meta**: Timestamps and duration.
- **system**: System information (CPU, RAM, Node version).
- **config**: The configuration used for the run.
- **summary**: High-level aggregated stats (Total Duration, Throughput Avg).
- **resultsAgg**: Aggregated metrics grouped by Library and File.
- **results**: The raw sample data.

### Example

```json
{
  "meta": {
    "startTime": "2023-10-27T10:00:00.000Z",
    "endTime": "2023-10-27T10:00:01.000Z",
    "durationMs": 1000
  },
  "summary": [
    {
      "Library": "lz4-divortio",
      "throughputAvg": 150.5,
      "totalDuration": 500,
      "filesProcessed": 1
    }
  ],
  "resultsAgg": [
    {
      "Library": "lz4-divortio",
      "File": "data.bin",
      "throughputAvg": 150.5,
      "throughputMed": 150.2,
      "throughputMax": 155.0,
      "ratioAvg": 0.45,
      "durationAvg": 100
    }
  ],
  "results": {
    "lz4-divortio": {
      "name": "lz4-divortio",
      "all": [ ...samples ]
    }
  }
}
```

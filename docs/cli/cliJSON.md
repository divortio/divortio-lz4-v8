# CLI JSON Output (`--json`)

The `--json` flag directs the CLI to output a single, machine-readable JSON object to `stdout`. This output contains high-precision metrics suitable for automated benchmarking, CI/CD pipelines, and performance analysis.

## Usage
```bash
node src/lz4CLI.js <compress|decompress> <file> --json
```

## Example Output
```json
{
  "startTime": 1705191834123,
  "startTimeH": "2026-01-13T23:57:14.123Z",
  "endTime": 1705191834135,
  "endTimeH": "2026-01-13T23:57:14.135Z",
  "command": "node src/lz4CLI.js compress data.bin -o data.lz4 --json",
  "input": {
    "path": "/abs/path/to/data.bin",
    "size": 1048576,
    "sizeH": "1.0 MB"
  },
  "read": {
    "size": 1048576,
    "sizeH": "1.0 MB",
    "durationMs": 0.583,
    "durationH": "0.583ms",
    "throughputMBps": 1715.266,
    "throughputH": "1715.3 MB/s"
  },
  "compress": {
    "inputSize": 1048576,
    "inputSizeH": "1.0 MB",
    "outputSize": 1048599,
    "outputSizeH": "1.0 MB",
    "durationMs": 4.125,
    "durationH": "4.125ms",
    "throughputMBps": 242.424,
    "throughputH": "242.4 MB/s",
    "ratioPct": 0.002,
    "ratioH": "+0.0%"
  },
  "write": {
    "size": 1048599,
    "sizeH": "1.0 MB",
    "durationMs": 1.167,
    "durationH": "1.167ms",
    "throughputMBps": 856.921,
    "throughputH": "856.9 MB/s"
  },
  "processed": {
    "command": "compress",
    "inputSize": 1048576,
    "inputSizeH": "1.0 MB",
    "outputSize": 1048599,
    "outputSizeH": "1.0 MB",
    "ratioPct": 0.002,
    "ratioH": "+0.0%",
    "durationMs": 9.459,
    "durationH": "9.459ms",
    "throughputMBps": 105.719,
    "throughputH": "105.7 MB/s"
  },
  "output": {
    "path": "/abs/path/to/data.lz4",
    "size": 1048599,
    "sizeH": "1.0 MB"
  }
}
```

## Schema Highlights
*   **Precision**: `durationMs`, `throughputMBps`, and `ratioPct` are provided as high-precision floating point numbers (3 decimal places).
*   **Human Readable Fields**: Fields with an `H` suffix (e.g., `sizeH`, `durationH`) provide pre-formatted strings for display.
*   **Timestamps**: `startTime` and `endTime` are Unix timestamps in milliseconds. ISO 8601 strings are provided in `*H` variants.
*   **Throughput**: All throughputs are measured in MB/s (Megabytes per second).
*   **Ratio**: Ratios are percentages, where positive indicates expansion and negative indicates compression.

## See Also
*   [cliLog.md](cliLog.md) - logging to file (supports JSON format).
*   [cliCompress.md](cliCompress.md) / [cliDecompress.md](cliDecompress.md) - Command usage.

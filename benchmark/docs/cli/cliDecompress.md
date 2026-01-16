# Benchmark CLI: Decompress

Run decompression benchmarks against libraries and inputs.

## Usage

```bash
node benchmark/bench.js decompress [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-l, --library <name>` | **Required**. The library to test. Can be specified multiple times. |
| `-i, --input <path>` | Input file path. Can be specified multiple times. |
| `-c, --corpus <name>` | Corpus name (e.g. `silesia`). Expands to all files in corpus. |
| `-s, --samples <n>` | Number of iterations per test (default: 5). |
| `-w, --warmup <n>` | Number of warmup iterations (default: 2). |

## Examples

**Run decompression benchmark:**
```bash
node benchmark/bench.js decompress -l v8.js.lz4Divortio -c silesia
```
node benchmark/bench.js decompress -l v8.js.lz4Divortio -c silesia
```

## Reporting
*   **Markdown/JSON/CSV**: Standard report generation. (See [cliMarkdown.md](cliMarkdown.md))
*   **Logging**: Streaming log to file. (See [cliLog.md](cliLog.md))

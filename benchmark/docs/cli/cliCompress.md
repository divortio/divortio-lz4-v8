# Benchmark CLI: Compress

Run compression benchmarks against libraries and inputs.

## Usage

```bash
node benchmark/bench.js compress [options]
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

**Run with one library and one corpus:**
```bash
node benchmark/bench.js compress --library v8.js.lz4Divortio --corpus silesia
```

**Run with multiple libraries:**
```bash
node benchmark/bench.js compress -l v8.js.lz4 -l v8.js.fflate -c silesia
```
node benchmark/bench.js compress -l v8.js.lz4 -l v8.js.fflate -c silesia
```

## Reporting
*   **Markdown/JSON/CSV**: Standard report generation. (See [cliMarkdown.md](cliMarkdown.md))
*   **Logging**: Streaming log to file. (See [cliLog.md](cliLog.md))

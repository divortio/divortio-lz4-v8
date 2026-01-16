# Benchmark CLI: Roundtrip

Run Roundtrip (Compression followed by Decompression) benchmarks.

## Usage

```bash
node benchmark/bench.js roundtrip [options]
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

**Run roundtrip benchmark:**
```bash
node benchmark/bench.js roundtrip -l v8.js.lz4Divortio -c silesia
```

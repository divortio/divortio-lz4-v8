# CLI Feature: Concatenated Corpus (.tar / .all)

Run benchmarks against a concatenated version of a corpus (tarball) to measure aggregate throughput and compression ratio on a single continuous stream.

## Usage

Append `.tar` or `.all` to any valid corpus name.

```bash
# Suffix alias .tar
node benchmark/bench.js compress -c silesia.tar

# Suffix alias .all
node benchmark/bench.js compress -c lz_flex.all
```

## How It Works

1.  **On-Demand Generation**: The CLI generates a temporary `.tar` file containing all files (except the tar itself) from the specified corpus directory.
2.  **No Storage**: The file is stored temporarily in the corpus cacheCorpus directory (`benchmark/.cacheCorpus/corpus/<name>`).
3.  **Clean Up**: The temporary file is automatically deleted when the benchmark finishes or exits (including crashes or interruptions), ensuring no wasted disk space.

## Use Cases

*   **Maximum Throughput**: Determine the sustained speed of a library over a large volume of data without per-file initialization overhead.
*   **Realistic Bulk Data**: Simulates compressing a large archive or stream.

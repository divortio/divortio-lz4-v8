# CLI Feature: Sequential Corpus Files

Run benchmarks on **every** file within a corpus, sequentially.

## Usage

Simply provide the corpus name.

```bash
node benchmark/bench.js compress -c silesia
```

## Behavior

*   Expands the corpus name into a listCorpora of all contained files.
*   The benchmark runner executes the test for each file independently.
*   Reports will show individual rows for each file.

## Use Cases

*   **Versatility Testing**: See how a library performs across diverse data types.
*   **Detailed Profiling**: Identify specific weaknesses (e.g., poor ratio on small files).

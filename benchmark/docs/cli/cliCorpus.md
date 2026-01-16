# CLI Feature: Corpus Input

The Benchmark CLI supports a rich set of options for defining corpus inputs, allowing you to target individual files, entire sets, or concatenated streams.

## Usage

Use the `--corpus` (or `-c`) argument to specify corpus inputs. You can mix and match multiple corpus inputs.

```bash
node benchmark/bench.js compress --corpus <reference>
```

## References

We support several reference formats to give you flexibility:

*   **Whole Corpus (Sequential)**: Run benchmarks on every file in the corpus individually.
    *   Example: `-c silesia`
    *   [Docs: cliCorpusFiles](cliCorpusFiles.md)

*   **Concatenated Corpus (Throughput)**: Run benchmark on a single tarball/concatenated stream of the corpus.
    *   Example: `-c silesia.tar` or `-c silesia.all`
    *   [Docs: cliCorpusTar](cliCorpusTar.md)

*   **Single File**: Run benchmark on a specific file within a corpus.
    *   Example: `-c silesia.dickens`
    *   [Docs: cliCorpusFile](cliCorpusFile.md)

## Available Corpora

To see the list of available corpora and their contents:

```bash
node benchmark/bench.js corpus
```

See [cliListCorpus.md](cliListCorpus.md) for more details.

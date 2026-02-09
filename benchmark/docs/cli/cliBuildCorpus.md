# Benchmark CLI: Build Corpus (`indexCorpus`)

Use the `indexCorpus` command to manage the benchmark corpus, including downloading standard corpora (like Silesia) or rebuilding the file index.

## Usage

```bash
node benchmark/bench.js indexCorpus [options]
```

## Options

| Option | Description |
|--------|-------------|
| `--name <name>` | The name of the corpus to build/download (e.g., `silesia`). Case-insensitive. |

## Examples

### Rebuild Index
If no name is provided, the command scans the `benchmark/src/corpus` directory and rebuilds the internal index of user-added files.

```bash
node benchmark/bench.js indexCorpus
```

### Download/Build Standard Corpus
Download and setup a known corpus defined in `corpusCatalog.js`.

```bash
node benchmark/bench.js indexCorpus --name silesia
```

## Auto-Download
Note that running a benchmark with a registered corpus will automatically trigger the download if the files are missing:

```bash
# Triggers built-in auto-download if silesia is missing
node benchmark/bench.js compress -c silesia -l lz4
```

## Source
See [src/cli/cliBuildCorpus.js](../../src/cli/args/corpus/cliBuildCorpus.js).

## See Also
*   [cliArgs.md](cliArgs.md) - Arguments reference.
*   [cliListCorpus.md](cliListCorpus.md) - Listing available corpora.

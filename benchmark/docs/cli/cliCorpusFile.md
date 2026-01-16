# CLI Feature: Single Corpus File

Target a specific file within a corpus for benchmarking.

## Usage

Use dot notation `<corpus>.<filename>`.

```bash
node benchmark/bench.js compress -c silesia.dickens
node benchmark/bench.js compress -c lz_flex.compression_1k.txt
```

## Notes

*   Support fuzzy matching on the filename (e.g. `silesia.dick` might work if unique).
*   Useful for isolating performance issues on specific data types (text vs binary).

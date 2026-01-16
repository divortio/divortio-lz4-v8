# CLI Command: List Corpus

List available corpora and contained files.

## Usage

```bash
node benchmark/bench.js corpus [filter]
# Alias
node benchmark/bench.js corpora ...
```

## Arguments

-   **filter**: Optional positional string to filter by corpus name or filename.

## Examples

**List all:**
```bash
node benchmark/bench.js corpus
```

**Filter for 'html':**
```bash
node benchmark/bench.js corpus html
```

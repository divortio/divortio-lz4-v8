# CLI Command: List Libraries

List and filter available benchmark libraries.

## Usage

```bash
node benchmark/bench.js libs [filter] [options]
# Alias
node benchmark/bench.js libraries ...
```

## Arguments

-   **filter**: Optional positional string to filter by name.
    -   Literal match: Checks for exact or substring match (default logic).
    -   Wildcard: Use `*` or `%` for simple wildcard matching (e.g. `v8*`).

## Options

-   `--env, --environment <name>`: Filter by Environment (e.g. `node`, `v8`). Smart matching (case insensitive, "nodejs" -> "node").
-   `--lang, --language <name>`: Filter by Language (e.g. `js`, `wasm`). Smart matching.

## Examples

**List all:**
```bash
node benchmark/bench.js libs
```

**Filter by Environment:**
```bash
node benchmark/bench.js libs --env v8
```

**Wildcard Search:**
```bash
node benchmark/bench.js libs "v8.js*"
```

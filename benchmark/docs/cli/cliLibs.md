# CLI Feature: Library Selection

The Benchmark CLI provides a flexible system for selecting compression libraries across different environments (Node.js, V8/JS, V8/WASM).

## Usage

Use the `--library` (or `-l`) argument to specify libraries. You can specify multiple libraries to benchmark them in sequence.

```bash
node benchmark/bench.js compress -i file.txt -l <library_ref>
```

## References

You can reference libraries using strict dot notation or fuzzy aliases.

### Dot Notation (Strict)

Format: `<environment>.<implementation>.<library>`

*   `node.lz4` (Node.js native binding)
*   `v8.js.lz4` (Pure JS implementation running in V8)
*   `v8.wasm.lz4` (WASM implementation running in V8)

### Aliases (Fuzzy)

You can often use the library name directly if it is unique.

*   `lz4` -> Resolves to the first match (usually `v8.js.lz4` or `node.lz4` depending on available catalogs).
*   `lz4-js` -> Resolves to `v8.js.lz4_js` (if named `lz4_js`).

## Listing Libraries

To see all available registered libraries and their exact keys:

```bash
node benchmark/bench.js libs
```

Use a filter to search:

```bash
node benchmark/bench.js libs lz4
```

See [cliListLibs.md](cliListLibs.md) for more details.

# Consolidate

[🏠 Home](../docs/src/README.md)

Opportunities to deduplicate code.

- [ ] **Hash Functions**:
    -   `xxHash32` (src/xxhash32), `hashU32` (src/shared/lz4Util), and `warmHashTable` (src/dictionary) all touch hashing.
    -   **Idea**: Centralize all Knuth hash logic in `src/shared/hashing.js`.

- [ ] **Stream/Buffer Encoders**:
    -   `bufferCompress` and `streamCompress` share similar header writing logic.
    -   **Idea**: Use `frame/frameHeader.js` more aggressively to share the exact same byte writing lines.

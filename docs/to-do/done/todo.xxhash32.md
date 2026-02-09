# Todo: xxHash32

[🏠 Home](../src/README.md) > [xxHash32](../src/xxhash32/README.md) > xxHash32

Source: [`src/xxhash32/xxhash32.js`](../../src/xxhash32/xxhash32.js)

## Optimizations
- [x] **State Reuse**:
    -   **Context**: `XXHash32` class creates a new `memory` buffer on instantiation.
    -   **Task**: Implement `reset(seed)` to reuse instance. (Implemented)
- [x] **Aligned Access**:
    -   **Context**: Reads 4-byte integers byte-by-byte.
    -   **Task**: Use `Uint32Array` view if `input.byteOffset` is aligned. (Implemented)

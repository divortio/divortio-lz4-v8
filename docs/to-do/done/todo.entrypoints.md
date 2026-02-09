# Todo: Entrypoints

[🏠 Home](../src/README.md) > [lz4](../src/lz4.md)

Source: [`src/lz4.js`](../../src/lz4.js)

## Refactoring
- [ ] **Lazy Loading**:
    -   **Context**: `lz4.js` imports *everything*.
    -   **Task**: Consider splitting entry points (e.g., `lz4-core.js`, `lz4-stream.js`) to support tree-shaking.

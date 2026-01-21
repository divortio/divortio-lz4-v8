# Todo: frameHeader

[🏠 Home](../src/README.md) > [Frame](../src/frame/README.md) > frameHeader

Source: [`src/frame/frameHeader.js`](../../src/frame/frameHeader.js)

## Verification
- [ ] **Large Content Size**:
    -   **Context**: Content size uses 64-bit integers (8 bytes). JS uses `Number` (double).
    -   **Task**: Verify behavior with >9PB inputs (Theoretical limit of JS integers). Ensure we don't overflow logic or format.

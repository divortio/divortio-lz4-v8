# Todo: dictionaryContext

[🏠 Home](../src/README.md) > [Dictionary](../src/dictionary/README.md) > dictionaryContext

Source: [`src/dictionary/dictionaryContext.js`](../../src/dictionary/dictionaryContext.js)

## Optimizations
- [ ] **External Dictionary**:
    -   **Context**: Currently copies dict + input into one buffer.
    -   **Task**: Implement "External Dicitonary" mode where the match finder checks bounds and reads from a separate dictionary buffer if the offset goes negative. Setup `context` with pointers rather than concatenated memory.

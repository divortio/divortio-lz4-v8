# dictionaryContext

[🏠 Home](../README.md) > [Dictionary](README.md) > dictionaryContext

Source: [`src/dictionary/dictionaryContext.js`](../../../../src/dictionary/dictionaryContext.js)

## Function: `prepareInputContext`
-   **Purpose**: Prepares the memory layout for dictionary-based compression.
-   **Mechanism**:
    -   Concatenates `dictionary` + `input` into a single `workingBuffer`.
    -   Calculates offsets so the compressor can slide smoothly from dictionary to input.
    -   **Constraint**: This involves copying input and dictionary, which consumes memory (See To-Do).

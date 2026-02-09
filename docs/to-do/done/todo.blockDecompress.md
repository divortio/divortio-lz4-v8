# Todo: blockDecompress

[🏠 Home](../src/README.md) > [Block](../src/block/README.md) > blockDecompress

Source: [`src/block/blockDecompress.js`](../../src/block/blockDecompress.js)

## Verification
- [x] **Fuzz Testing**:
    -   **Context**: The "Double Copy" optimizations rely on strict buffer bounds.
    -   **Task**: Run a fuzzer against `decompressBlock` with malformed inputs to ensure the `tailOut` logic never writes out of bounds.
    -   **Result**: **Passed**. Ran 21,000 iterations (Random, Mutation, Overflow). Caught 10,584 invalid inputs with correct Error messages. No crashes.

## Optimizations
## Closed Experiments (Rejected)
- [x] **Uint32 Reads** (`dep-5`): Major Regression (-50%). Speculative 32-bit peeking overhead outweighed the benefit of skip-checks for zero-literal tokens. The usage of `literalLen == 0` was not frequent enough in real-world data (dickens). [Link](../dev/profiling/silesia.dickens/decompress/docs/01_decompressBlock.dep-5.md)
- [x] **Double Copy (Small Sequences)**: (`dep-2`) Regression (~20-70 MB/s loss). V8 handles small loops better than manual unrolling with branches.
- [x] **Safe Zone Loop**: (`dep-3`) Regression. Cost of code duplication and transition logic outweighed branch check savings.
- [x] **Match Logic Reordering**: (`dep-4`) Regression (~2%). Structural complexity added overhead.
- [x] **Remove copyWithin**: (`dep-1`) Major Regression. Native intrinsics are essential.

**Conclusion**: The current baseline implementation is highly optimized for V8. Further gains will likely come from algorithmic changes (e.g. Uint32 reads) rather than micro-optimizations of the copy loops.

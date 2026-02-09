# Fuzz Testing Plan: decompressBlock

**Goal**: Verify memory safety and error handling of `decompressBlock.js` under hostile input conditions.
**Focus**: "Double Copy" internal optimizations (8-byte unaligned writes) which might bypass standard boundary checks if not carefully guarded.

## Strategy

1.  **Dumb Fuzzing (Random Noise)**
    *   Input: `Uint8Array` of random length (0-65KB) filled with random bytes.
    *   Expectation: Should throw `Error("LZ4: Malformed Input")` or `Error("LZ4: Invalid Offset")` or finish (rarely). Should NEVER infinite loop or hang.

2.  **Smart Fuzzing (Mutation)**
    *   Input: Take a *valid* compressed block (e.g., compressed "Hello World").
    *   Mutation:
        *   Flip bits in Token.
        *   Change Literal Length bytes.
        *   Change Offset bytes (0, Max, -1).
        *   Truncate stream at critical points (mid-literal, mid-match).
    *   Expectation: Predictable errors.

3.  **Boundary & Overflow Fuzzing**
    *   Mock Inputs designed to trigger the "Double Copy" paths (LiteralLen >= 8, MatchLen >= 8) appearing right at the end of the Output buffer.
    *   Test: Output Buffer size = exact needed size - 1.
    *   Expectation: `decompressBlock` MUST throw "Output Buffer Too Small" before writing.

## Implementation
*   Script: `test/fuzz/decompressFuzzer.js`
*   Dependencies: `src/block/blockDecompress.js`, `src/block/blockCompress.js` (to generate seeds).
*   Runner: Standalone Node.js script.

## Success Criteria
*   Run 1,000,000 iterations.
*   0 Crashes (Node process exit).
*   0 Infinite Loops (Timeout detection).
*   Errors thrown must be descriptive strings, not `RangeError` (ideally).

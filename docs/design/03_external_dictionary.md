# Design: External Dictionary (Zero-Copy)

**Goal**: Enable `compressBlock` to reference a dictionary buffer separate from the input buffer, eliminating the need to copy history (64KB) + input into a contiguous buffer.

## Current State
`compressBlock(src, ...)` assumes `src` contains `[History][Input]`.
Matches found in `History` are accessed via `src[mIndex]`.
`LZ4Encoder` manages this by concatenating: `buffer = [History] + [New Data]`.
This causes `O(N)` copies (or worse with gradual accumulation) and GC churn.

## Proposed Solution: `compressBlockExt`

A new kernel function (or mode) that accepts `dictionary` and `input`.

### Virtual Address Space
We maintain the illusion of a contiguous space for the Hash Table.
*   `0` to `dictLen`: Mapped to `dictionary`.
*   `dictLen` to `dictLen + inputLen`: Mapped to `input`.

### Access Pattern
When `mIndex` (match index) is retrieved:
1.  **Check Boundary**: `if (mIndex < dictLen)`?
    *   Yes: Read from `dictionary[mIndex]`.
    *   No: Read from `input[mIndex - dictLen]`.

### Challenge: Performance
A conditional check on *every* match byte verification (`src[sPtr] === src[mPtr]`) is disastrous.

### Optimization Strategy
1.  **Split Verification**:
    *   If `mIndex` is in Dictionary:
        *   Verify match in Dictionary until `dictLimit`.
        *   If match continues, switch to `input` verification.
    *   If `mIndex` is in Input:
        *   Standard verification (Input only).

2.  **Logic**:
    ```javascript
    if (mIndex < dictLen) {
        // External Match
        let len = 0;
        // 1. Match in Dictionary
        while (sPtr < matchLimit && mPtr < dictLen && input[sPtr] === dictionary[mPtr]) {
            sPtr++; mPtr++;
        }
        // 2. Match crosses boundary?
        if (mPtr === dictLen) {
            mPtr = 0; // Reset to start of Input (Virtual Index `dictLen` maps to Input[0])
            while (sPtr < matchLimit && input[sPtr] === input[mPtr]) {
                sPtr++; mPtr++;
            }
        }
    } else {
        // Internal Match (Standard)
        // input[mIndex - dictLen] ...
    }
    ```

### API Changes
*   `compressBlock(input, output, ..., dictionary)`
*   If `dictionary` is null: Fast Path (Standard).
*   If `dictionary` is provided: External Path.

## Impact
*   `LZ4Encoder` can stop concatenating `this.dictionary` + `chunk`.
*   Significant memory bandwidth saving for small chunk streams.

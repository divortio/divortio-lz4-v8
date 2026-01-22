# Experiment: `thy-1b` Flatten `Math.imul`

**Status**: In Progress
**Target**: `src/block/blockCompress.js`
**Parent**: [01_compressBlock.md](01_compressBlock.md)

## 1. Hypothesis
`Math.imul` is the standard way to perform 32-bit integer multiplication in JavaScript. However, function calls (even on the `Math` object) *might* theoretically incur overhead or implicit deopt checks compared to native operators, although V8 generally optimizes `Math.imul` to a single CPU instruction.

This experiment replaces `Math.imul(seq, HASH_MULTIPLIER)` with `(seq * HASH_MULTIPLIER) | 0`.

**Risk**: In standard JavaScript (IEEE 754), `a * b` may exceed safe integer precision ($2^{53}$). Since `HASH_MULTIPLIER` and `seq` are 32-bit, the product can exceed 53 bits. The `| 0` truncation operates on the potentially imprecise floating-point result, which **differs** from the true 32-bit wrap-around behavior of `Math.imul`. This might degrade hash quality (more collisions or fewer matches), potentially affecting compression ratio or throughput (due to collision handling).

We test if this "native" operator usage provides any TurboFan hints that outweigh the mathematical "incorrectness" of the hash.

## 2. Prescribed Change

**File**: [`src/block/blockCompress.js`](../../../../src/block/blockCompress.js)

```javascript
// BEFORE
hash = (Math.imul(seq, HASH_MULTIPLIER) >>> HASH_SHIFT) | 0;

// AFTER
// Using native multiplication (precision loss expected for high values)
hash = ((seq * HASH_MULTIPLIER) >>> HASH_SHIFT) | 0;
```

## 3. Results

### Metrics
| Metric | Baseline (thy-1a) | `thy-1b` Result | Delta |
| :--- | :--- | :--- | :--- |
| **Throughput (Bench)** | ~106 MB/s | ~101 MB/s | -4.7% (Noise/Slight Regression) |
| **Throughput (Prof)** | ~106.1 MB/s | ~99.7 MB/s | -6.0% |
| **Optimization Status** | Interpreted | Interpreted | Unchanged |
| **Compression Ratio** | 0.380 | 0.380 | Identical |

### Analysis
Replacing `Math.imul` with `* | 0` **did not** trigger TurboFan optimization. The function remains Interpreted. 
-   **Performance**: Throughput was slightly lower (likely noise or minor regression due to float conversion).
-   **Correctness**: While the compression ratio didn't degrade for `dickens`, the risk of hash collisions due to precision loss remains.
-   **Conclusion**: Since there is no V8 optimization gain to outweigh the semantic incorrectness, `Math.imul` is the superior choice.

## 4. Conclusions
1.  **`Math.imul` is not the blocker.** V8 handles `imul` efficiently enough (likely single instruction), or at least it's not the reason the function is stuck in Interpretation.
2.  **No benefit to "native" math.**
3.  **Next Step**: Reject this change.

## 5. Decision
**Rejected**
*Options: [Accept / Reject]*
*Reasoning: No performance gain, potential precision risks.*

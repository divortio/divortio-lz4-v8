# Experiment: `thy-3a` Hot Loop Split

**Status**: In Progress
**Target**: `src/block/blockCompress.js`
**Parent**: [01_compressBlock.md](01_compressBlock.md)

## 1. Hypothesis
`compressBlock` is currently optimizing via OSR (On-Stack Replacement) rather than Entry Optimization because it is a single long-running loop called infrequently.
While OSR is effective, standard Entry Optimization allows for better code generation and potentially better stability.

By extracting the hot inner loop into a separate function `compressLoop`, we do NOT increase the call count significantly (it's still 1 call per block), BUT we reduce the complexity of the outer function. More importantly, we test if isolating the loop logic allows V8 to handle the control flow more cleanly.

**Challenge**: The loop modifies 3 variables: `sIndex`, `dIndex`, and `mAnchor`.
**Solution**: Pass a mutable state object `{ s, d, anchor }`.
**Risk**: Accessing object properties (`state.s`) is generally slower than local variables (registers) unless V8 performs Scalar Replacement (Escape Analysis).

## 2. Prescribed Change

**File**: [`src/block/blockCompress.js`](../../../../src/block/blockCompress.js)

Refactor `compressBlock` to:
1.  Initialize state object.
2.  Call `compressLoop(state, src, output, ...)`
3.  Handle tail using state properties.

```javascript
function compressLoop(state, src, output, hashTable, mflimit, matchLimit) {
  // Unpack to locals for speed? Or use state directly?
  // Using direct property access to test splitting.
  var sIndex = state.s | 0;
  // ...
  while (...) {
     // ... logic ...
  }
  // Write back
  state.s = sIndex;
  // ...
}
```

*Refinement*: To minimize property access cost, we will **unpack** state to locals at the start of `compressLoop` and **re-pack** at the end. This keeps the loop body running on registers.

## 3. Results

### Metrics
| Metric | Baseline (thy-1a) | `thy-3a` Result | Delta |
| :--- | :--- | :--- | :--- |
| **Throughput (Bench)** | ~106 MB/s | ~102 MB/s | -3.8% (Regression) |
| **Optimization Status** | Interpreted (OSR) | Interpreted (OSR) | Unchanged |
| **Ticks (JS)** | 1124 | 1474 | Higher (likely due to call/state overhead) |

### Analysis
Extracting the hot loop into `compressLoop` **failed** to trigger Entry Optimization.
-   **Status**: The function remains "Interpreted", meaning V8 is still relying on OSR because the call count (1-3 calls per benchmark sample) is too low to trigger aggressive entry optimization, regardless of function size.
-   **Performance**: The overhead of creating/unpacking the `state` object and the extra function call caused a ~4% regression.
-   **Conclusion**: The "Mega Function" (`thy-1a`) is the optimal structure for this workload. V8's OSR is handling it well (as confirmed by `dia-1`), and artificially splitting it only adds JS overhead.

## 4. Conclusions
1.  **Function Size is not the blocker.** OSR works fine on the large function.
2.  **Call Frequency is the blocker for Entry Opt**, but it doesn't matter since OSR is effective.
3.  **Next Step**: Reject `thy-3a`. Revert to `thy-1a`.

## 5. Decision
**Rejected**
*Options: [Accept / Reject]*
*Reasoning: Performance regression (-4%) and failed to trigger Entry Optimization.*

# Experiment: `thy-3b` Int32Array Monomorphism

**Status**: In Progress
**Target**: `src/block/blockCompress.js`
**Parent**: [01_compressBlock.md](01_compressBlock.md)

## 1. Hypothesis
V8 optimization of `Int32Array` access is highly dependent on knowing the object shape and constructor. If `hashTable` is polymorphic (or if V8 just isn't sure), it generates slower access code with safety checks.

By inserting an explicit **type guard** at the top of the function:
```javascript
if (hashTable.constructor !== Int32Array) {
    throw new Error("Validation Error: hashTable must be Int32Array");
}
```
We force V8's flow analysis to assume `hashTable` is `Int32Array` for all subsequent code, potentially enabling specialized load/store elimination (`Int32Array` accesses are just memory offsets).

## 2. Prescribed Change

**File**: [`src/block/blockCompress.js`](../../../../src/block/blockCompress.js)

Insert type guard before the hot loop.

## 3. Results

### Metrics
| Metric | Baseline (thy-1a) | `thy-3b` Result | Delta |
| :--- | :--- | :--- | :--- |
| **Throughput (Bench)** | ~106 MB/s | ~88.6 MB/s | -16.4% (Regression) |
| **Throughput (Prof)** | ~106 MB/s | ~78.5 MB/s | -26% (Severe Regression) |
| **Optimization Status** | Interpreted (OSR) | Interpreted | Unchanged |

### Analysis
Adding the `hashTable.constructor !== Int32Array` type guard caused a severe performance penalty.
-   **Hypothesis Failure**: Instead of enabling optimizations, the explicit check likely interfered with V8's existing type feedback or added overhead that delayed OSR.
-   **Conclusion**: V8 is already handling the `Int32Array` access efficiently via OSR. Adding manual checks is counter-productive.

## 4. Conclusions
1.  **Don't fight the compiler.** Manual type guards can hurt more than they help if the compiler has already inferred types.
2.  **Next Step**: Reject `thy-3b`. Stick to `thy-1a`.

## 5. Decision
**Rejected**
*Options: [Accept / Reject]*
*Reasoning: Severe performance regression (-16%).*

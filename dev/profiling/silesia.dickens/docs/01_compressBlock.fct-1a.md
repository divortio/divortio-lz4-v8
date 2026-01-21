# Experiment: `fct-1a` Zero Allocation

**Status**: In Progress
**Target**: `src/block/blockLiterals.js`
**Parent**: [01_compressBlock.md](01_compressBlock.md)

## 1. Hypothesis
The usage of `src.subarray(start, end)` creates a temporary `Uint8Array` view object. In a hot loop like `encodeLiterals` (called once per sequence), creating thousands of short-lived objects triggers Minor GC (Scavenge). This GC pressure can:
1.  Cause execution jitter.
2.  Pollute the heap.
3.  Potentially trigger de-optimization if V8 decides the allocation site is "megamorphic" or unstable.

Replacing this with a simple manual copy loop ensures **Zero Allocation** behavior for the literal copying phase.

## 2. Prescribed Change

**File**: [`src/block/blockLiterals.js`](../../../../src/block/blockLiterals.js)

```javascript
// BEFORE
if (litLen > 128) {
    output.set(src.subarray(litSrc, litSrc + litLen), dIndex);
    dIndex = litEnd;
}

// AFTER
if (litLen > 128) {
    // Zero-Allocation Copy Loop
    while (dIndex < litEnd) {
        output[dIndex++] = src[litSrc++];
    }
    // dIndex is already at litEnd
}
```

## 3. Results

### Metrics
| Metric | Baseline | `fct-1a` Result | Delta |
| :--- | :--- | :--- | :--- |
| **Throughput** | 91.5 MB/s | ~87.4 MB/s | -4.5% (Regression) |
| **Optimization Status** | Interpreted | Interpreted | Unchanged |
| **Ticks (JS)** | 465 | 468 | +0.6% |

### Analysis
*To be filled after execution.*

## 4. Conclusions
*To be filled after execution.*

## 5. Decision
**Pending**
*Options: [Accept / Reject]*
*Reasoning: ...*


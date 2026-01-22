# Experiment: `thy-2a` BlockCompressor Class

**Status**: In Progress
**Target**: `src/block/blockCompressor.js`, `src/buffer/bufferCompress.js`
**Parent**: [01_compressBlock.md](01_compressBlock.md)

## 1. Hypothesis
Currently, `compressBlock` requires passing 6 arguments (`src`, `output`, `srcStart`, `srcLen`, `hashTable`, `outputOffset`) for every block. In a multi-block frame, `src`, `output`, and `hashTable` remain constant.

Passing many arguments to a hot function can increase stack pressure. By encapsulating the constant state (`src`, `output`, `hashTable`) into a `BlockCompressor` class instance, we can reduce the method signature to `compress(srcStart, srcLen, outputOffset)`.

**Trade-off**:
-   **Pros**: Cleaner signature, potentially better register allocation for the constant fields (`this.src` etc.) if V8 optimizes the class access (inline caching).
-   **Cons**: Object allocation overhead (creating `new BlockCompressor` per frame). Bounds checks might be harder to eliminate if `this.src` is considered mutable (field access vs local var).

## 2. Prescribed Change

**New File**: `src/block/blockCompressor.js`
-   Implements `BlockCompressor` class.
-   Copies the **inlined** logic from `thy-1a` (`blockCompress.js`).

**File**: `src/buffer/bufferCompress.js`
-   Instantiate `BlockCompressor` once per frame.
-   Call `compressor.compressBlock(...)` in the loop.

## 3. Results

### Metrics
| Metric | Baseline (thy-1a) | `thy-2a` Result | Delta |
| :--- | :--- | :--- | :--- |
| **Throughput (Bench)** | ~106 MB/s | ~93.6 MB/s | -11.7% (Regression) |
| **Throughput (Prof)** | ~106.1 MB/s | ~108.1 MB/s | +1.9% |
| **Optimization Status** | Interpreted | Interpreted | Unchanged |
| **Ticks (JS)** | 1124 | 1086 | Similar |

### Analysis
Encapsulating state in a `BlockCompressor` class yielded mixed results:
-   **Benchmark Regression**: The overall throughput dropped by ~12%. This is likely due to the overhead of allocating `new BlockCompressor` for every frame (even if only once per 10MB), or the class method invocation overhead in V8 (polymorphic inline cache misses if shape changes, though it shouldn't).
-   **Profile gain**: The raw loop speed (profile) was slightly faster, possibly due to cleaner register pressure for arguments.
-   **Optimization**: The functional core remains **Interpreted**. The Class wrapper did not trick V8 into optimizing it.

## 4. Conclusions
1.  **Class overhead > Argument overhead.** For this workload, passing 6 args to a static function is cheaper than creating an object to hold them.
2.  **No Optimization Magic.** V8 still refuses to compile the hot loop.
3.  **Next Step**: Reject `thy-2a`. We should stick to the high-performance functional approach (`thy-1a`).

## 5. Decision
**Rejected**
*Options: [Accept / Reject]*
*Reasoning: Benchmark regression (-12%) due to object allocation overhead.*

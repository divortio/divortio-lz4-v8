# Optimization Plan: `compressBlock`

**Status**: Living Document
**Target**: `src/block/blockCompress.js`
**Related Baseline**: [00_baseline.md](00_baseline.md)

## 1. Problem Analysis
The `compressBlock` function is the core hot path for LZ4 compression. Profiling indicates it consumes **~59%** of total execution time but is running in an **Interpreted** state (Optimization Status: `Interpreted` / `~`).

This means V8's TurboFan compiler has either:
1.  Failed to optimize the function (Bailout).
2.  Optimized and then De-optimized it repeatedly (Deopt Loop) until it gave up.
3.  Determined the function is not "hot" enough (unlikely given tick count).

When a core loop is interpreted, we miss out on:
-   Register allocation optimization.
-   Instruction selection (using specific CPU instructions for bitwise ops).
-   Inlining of helper functions.
-   Bounds check elimination.

## 2. Baseline Metrics
Ref: [00_baseline.md](00_baseline.md)
-   **Throughput**: ~91.5 MB/s
-   **Status**: Interpreted (Red Flag)
-   **Hotness**: 465/513 Ticks (JS)

## 3. Proposed Solutions & Experiments

We follow a conservative, scientific approach. Each experiment is performed in isolation. Results are documented in separate files (e.g., `01_compressBlock.fct-1a.md`).

### Facts (`fct`)
Known anti-patterns with robust, low-risk solutions. We expect these to apply regardless of architectural changes.

#### Experiment `fct-1a`: Zero Allocation (Remove `subarray`)
**Hypothesis**: Short-lived `Uint8Array` allocations in `encodeLiterals` (via `src.subarray`) trigger GC pressure or cache pollution, preventing stable optimization.
**Action**: Replace `subarray` + `set` with a manual copy loop.
**Goal**: Eliminate all object allocations in the hot path.

#### Experiment `fct-1b`: Enforce Monomorphism
**Hypothesis**: Polymorphic inputs (mixing `Buffer`/`Uint8Array`) cause V8 to deopt accessors.
**Action**: Strictly enforce `Uint8Array` input type at the entrypoint level (or explicit cast before hot loop).

### Theories (`thy`)
Structural changes or experimental optimizations. These carry higher risk of regression or complexity but target the specific "Interpreted" behavior.

#### Experiment `thy-1a`: Manual Inlining ("Mega-Function")
**Hypothesis**: The module boundary calls (`encodeLiterals`, `encodeMatch`) create overhead and optimization barriers. V8 fails to inline them automatically due to heuristic limits or import indirection.
**Action**: Manually inline dependencies into `compressBlock`, creating a single monomorphic function.
**Goal**: Provide TurboFan with a complete view of the loop for Bounds Check Elimination (BCE) and Register Allocation.

#### Experiment `thy-1b`: Flatten `Math.imul`
**Hypothesis**: `Math.imul` might be inducing unnecessary overhead if inputs are provably safe 32-bit integers.
**Action**: Replace `Math.imul(a, b)` with `(a * b) | 0` (if safe).

#### Experiment `thy-2a`: Class-Based Context (`BlockCompressor`)
**Hypothesis**: Functional arguments (`src`, `output`, `hashTable`) are passed repeatedly, increasing stack pressure and potentially confusing escape analysis. A class instance holding this state in `this.*` (monomorphic fields) might be more efficient.
**Action**: Create `src/block/blockCompressor.js`.
-   **Class**: `BlockCompressor`
-   **Fields**: `this.src`, `this.output`, `this.hashTable`
-   **Method**: `compressBlock(srcPos, blockSize, outPos)`
**Goal**: Reduce call overhead and localize state.

#### Experiment `thy-2b`: `BufferCompressor` Refactor
**Dependency**: Requires success of `thy-2a`.
**Hypothesis**: Extending the class model up the stack to `bufferCompress.js` further improves state management.
**Action**: Refactor `bufferCompress.js` to utilize `BlockCompressor` pattern fully.

## 4. Experiment Log

| ID | Experiment | Status | Baseline | Result | Diff | Decision | Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0.0** | Baseline | **Done** | - | 91.5 MB/s | - | - | [00_baseline.md](00_baseline.md) |
| **fct-1a** | Zero Alloc (`subarray`) | **Executed** | 91.5 MB/s | ~92.2 MB/s | +0.7% | **Accepted** | [Link](01_compressBlock.fct-1a.md) |
| **fct-1b** | Monomorphism (Copy) | **Executed** | 92.2 MB/s | ~81.7 MB/s | -11.4% | **Rejected** | [Link](01_compressBlock.fct-1b.md) |
| **thy-1a** | Manual Inlining | Pending | | | | |
| **thy-2a** | `BlockCompressor` Class | Pending | | | | |

## 5. Conclusions
*To be populated after experiments.*

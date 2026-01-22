# Experiment: `dia-1` V8 Tracing

**Status**: In Progress
**Target**: `src/block/blockCompress.js` (Diagnostics)
**Parent**: [01_compressBlock.md](01_compressBlock.md)

## 1. Goal
Identify why `compressBlock` remains **Interpreted** despite manual inlining (`thy-1a`).
We suspect one of:
1.  **Optimization Bailout**: V8 tries to optimize but fails (e.g., function too big, try/catch, unsupported op).
2.  **Deoptimization Loop**: V8 optimizes, hits an assumption violation (Type Feedback), deoptimizes, and eventually gives up (marking it "don't optimize").
3.  **Baseline (Sparkplug)**: It might be running in Sparkplug (Baseline) mode, which identifying as "Interpreted" in some tools, but is actually compiled.

## 2. Methodology
Run the compression workload directly with V8 trace flags.

**Command**:
```bash
node --trace-opt --trace-deopt --trace-bailout \
  benchmark/src/profile/workloads/profileCompressWorkload.js \
  -l lz4-divortio \
  -i .cache/corpus/silesia/dickens \
  -s 1 -w 0
```

*Note*: We run 1 sample with 0 warmups (or minimal) to catch the *first* optimization attempt.

## 3. Results

### Trace Output
```
[marking ... JSFunction compressBlock ... for optimization to MAGLEV ... reason: hot and stable]
[compiling method ... (target MAGLEV) OSR ...]
[completed compiling ... (target MAGLEV) OSR ...]
[compiling method ... (target TURBOFAN_JS) OSR ...]
[completed compiling ... (target TURBOFAN_JS) OSR ...]
[completed optimizing ... (target TURBOFAN_JS) OSR]
```
No `deoptimizing` events found.

### Analysis
The function **IS** being optimized by TurboFan, but via **On-Stack Replacement (OSR)**.
-   **OSR**: Since the function has one massive loop and is called infrequently (once per block), V8 optimizes the *loop* while it's running, rather than the function entry point.
-   **Interpreted Label**: Profilers often label functions as "Interpreted" if the entry point isn't optimized, even if 99% of execution happens in the OSR'd loop code.
-   **Stability**: The lack of deopts ("stable") confirms that our manual inlining (`thy-1a`) created a monomorphic, optimizing-friendly code structure.

## 4. Conclusions
1.  **Optimization Success**: `compressBlock` is running in TurboFan (OSR).
2.  **Reporting Artifact**: The "Interpreted" status is a false negative for performance, but accurately reflects that *entry* optimization hasn't occurred.
3.  **Next Step**: Proceed to `thy-3a` (Code Splitting). Extracting the hot loop into a separate function will allow it to be entry-optimized (standard compilation) rather than relying on OSR, which is clearer and potentially faster.

## 5. Decision
**Done**
*Findings: Validated thy-1a success. Proceed to thy-3a.*

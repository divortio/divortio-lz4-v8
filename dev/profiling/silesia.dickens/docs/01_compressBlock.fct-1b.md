# Experiment: `fct-1b` Enforce Monomorphism

**Status**: In Progress
**Target**: `benchmark/src/bench/compress/benchCompressInProc.js`
**Parent**: [01_compressBlock.md](01_compressBlock.md)

## 1. Hypothesis
V8 handles `Buffer` (subclass of `Uint8Array`) and pure `Uint8Array` slightly differently regarding hidden classes and element accessors. If `compressBlock` receives `Buffer` in some calls (e.g., from Node.js `fs.readFileSync`) and `Uint8Array` in others (e.g., sliced views), it might become polymorphic, causing V8 to de-optimize or stick to a generic (slower) path.

By enforcing the input to be a pure `Uint8Array` (stripping the Buffer prototype) before entering the hot loop, we ensure **Monomorphism**.

## 2. Prescribed Change

**File**: [`benchmark/src/bench/compress/benchCompressInProc.js`](../../../../benchmark/src/bench/compress/benchCompressInProc.js)

```javascript
// BEFORE
const inputBuffer = this.inputFile.load(); // Returns Buffer

// AFTER
// Convert to pure Uint8Array to ensure monomorphism in V8
const rawBuffer = this.inputFile.load();
const inputBuffer = new Uint8Array(rawBuffer.buffer.slice(rawBuffer.byteOffset, rawBuffer.byteOffset + rawBuffer.byteLength));
```

*Note*: We use `slice` to ensure we get a clean ArrayBuffer reference, or at least a standard `Uint8Array` view, decoupling it from the Node.js Buffer pool if possible.

## 3. Results

### Metrics
| Metric | Baseline | `fct-1a` | `fct-1b` Result | Delta (vs 1a) |
| :--- | :--- | :--- | :--- | :--- |
| **Throughput** | 91.5 MB/s | 92.2 MB/s | ~81.7 MB/s | -11.4% (Significant Regression) |
| **Optimization Status** | Interpreted | Interpreted | Interpreted | Unchanged |
| **Ticks (JS)** | 465 | 1143 | 1240 | +8.5% (Slower execution) |

### Analysis
Enforcing "clean" `Uint8Array` inputs via a copy actually **degraded** performance significantly (-11%).
-   **Optimization Failure**: `compressBlock` remains Interpreted. V8 did not treat the new array references any better.
-   **Buffer Optimization**: Node.js aggressively optimizes `Buffer` objects. By moving to a generic `Uint8Array` (and incurring a copy cost), we likely lost those internal fast-paths or simply added O(N) allocation overhead before every benchmark sample.
-   **Monomorphism**: The theory that `Buffer` vs `Uint8Array` polymorphism is the root cause is essentially disproven or at least shown to be less impactful than the cost of trying to fix it this way.

## 4. Conclusions
1.  **Polymorphism is unlikely the interpret-blocker.** 
2.  **`Buffer` is faster than generic `Uint8Array`** in this context, or the copy overhead is prohibitive.
3.  **Next Step**: Reject this change. The system is better off handling Buffers naturally. We must move to `thy-1a` (Manual Inlining) which targets the module structure.

## 5. Decision
**Rejected**
*Options: [Accept / Reject]*
*Reasoning: Caused significant performance regression (-11%) due to copy overhead/loss of Buffer optimization.*

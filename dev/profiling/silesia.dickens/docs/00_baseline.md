# Baseline Profile: lz4-divortio

**Date**: 2026-01-21
**Workload**: `compress`
**Corpus**: `silesia/dickens` (10.19 MB)

## 1. Objective
Establish a performance baseline for the refined `lz4-divortio` implementation using the V8 profiler to identify bottlenecks and accurate throughput.

## 2. Methodology & Throughput
The measurement was conducted using the `benchProf.compress` orchestrator, which executes a 10-sample benchmark followed by a V8 profile run.

- **Job ID**: `1768997270252`
- **Orchestrator**: `dev/profiling/silesia.dickens/benchProf.compress.lz4-divortio_silesia.dickens.js`
- **Throughput Logic**:
    - **Benchmark**: Average of 10 samples (excluding 5 warmups).
    - **Profile**: Based on precise loop duration of 5 samples (excluding 1 warmup).
- **Results**:
    - **Benchmark Throughput**: **~91.45 MB/s** (Mean) / **95.89 MB/s** (Avg)
    - **Profile Throughput**: **~91.27 MB/s**
    - **Input**: `dickens` (10.19 MB)
    - **Consistency**: High. Profile overhead is negligible with current sampling.

## 3. Meta Analysis Results
Analysis of the hot path during the profile run.

### Execution Breakdown
- **JS**: ~84%
- **C++**: ~13%
- **GC**: 0%

### Hot JS Functions
| Function | Status | Ticks | % |
| :--- | :--- | :--- | :--- |
| `compressBlock file:///src/block/blockCompress.js:34:30` | Interpreted | ~465 | **58.6%** |
| `encodeLiterals file:///src/block/blockLiterals.js:15:31` | Interpreted | ~47 | **5.9%** |

**Critical Insight**: The `compressBlock` function is the primary bottleneck (~59% of ticks) and is running as **Interpreted**. It is NOT successfully optimized by V8 (TurboFan). This is the highest priority target for optimization.

## 4. Generated Artifacts
Location: `dev/profiling/silesia.dickens/results/1768997270252/`
- **Benchmark Report**: `bench_1768997270252.json`
- **Profile Meta**: `profTickProcMeta_lz4-divortio_1768997283361.meta.md`
- **Raw Profile**: `profTick_lz4-divortio_1768997283361.v8.log`

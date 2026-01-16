# Benchmark Report
**Date:** 2026-01-12T04:44:00.340-05:00

---


## Command
```bash
node benchRun.js \
  --library v8.js.lz4Divortio \
  --library v8.js.fflate \
  --corpus "silesia" \
  --samples 5 \
  --warmups 2
```

## System Information
> Environment details where the benchmark was executed.

| System Field | Specification |
| --- | --- |
| cpu.model | Intel(R) Core(TM) i7-4870HQ CPU @ 2.50GHz |
| cpu.cores | 8 |
| cpu.speed | 2500 |
| cpu.arch | x64 |
| memory.totalBytes | 17179869184 |
| memory.freeBytes | 60858368 |
| memory.totalGB | 16 |
| os.platform | Darwin |
| os.type | darwin |
| os.release | 21.6.0 |
| runtime.name | Node.js |
| runtime.version | v24.10.0 |
| runtime.v8 | 13.6.233.10-node.28 |
| runtime.pid | 88723 |

---


## Inputs
> Files and corpora used in this benchmark.

| Corpus | Filename | Size |
| --- | --- | --- |
| silesia | dickens | 9.72 MB |
| silesia | mozilla | 48.85 MB |
| silesia | mr | 9.51 MB |
| silesia | nci | 32 MB |
| silesia | ooffice | 5.87 MB |
| silesia | osdb | 9.62 MB |
| silesia | reymont | 6.32 MB |
| silesia | samba | 20.61 MB |
| silesia | sao | 6.92 MB |
| silesia | webster | 39.54 MB |
| silesia | x-ray | 8.08 MB |
| silesia | xml | 5.1 MB |


## Libraries
> Libraries and versions tested.

| Environment | Language | Package | Library |
| --- | --- | --- | --- |
| V8 | Javascript | fflate | v8.js.fflate |
| V8 | Javascript | lz4-divortio | v8.js.lz4Divortio |

---


## Summary & Leaderboard
> Aggregated metrics (Median Throughput, Average Duration).

| Library | Corpus | File | medRatio | medDuration | medThroughput |
| --- | --- | --- | --- | --- | --- |
| v8.js.lz4Divortio | silesia | xml | 0.76 | 38.7 ms | 131.9 MB/s |
| v8.js.lz4Divortio | silesia | nci | 0.83 | 333.7 ms | 95.9 MB/s |
| v8.js.lz4Divortio | silesia | mr | 0.43 | 154.6 ms | 61.5 MB/s |
| v8.js.lz4Divortio | silesia | mozilla | 0.49 | 896.4 ms | 54.5 MB/s |
| v8.js.lz4Divortio | silesia | dickens | 0.38 | 246.9 ms | 39.4 MB/s |
| v8.js.lz4Divortio | silesia | webster | 0.52 | 1165.9 ms | 33.9 MB/s |
| v8.js.lz4Divortio | silesia | samba | 0.63 | 657.6 ms | 31.3 MB/s |
| v8.js.lz4Divortio | silesia | x-ray | 0.07 | 280.8 ms | 28.8 MB/s |
| v8.js.lz4Divortio | silesia | reymont | 0.47 | 260.7 ms | 24.2 MB/s |
| v8.js.lz4Divortio | silesia | osdb | 0.52 | 429.0 ms | 22.4 MB/s |
| v8.js.lz4Divortio | silesia | sao | 0.12 | 409.5 ms | 16.9 MB/s |
| v8.js.lz4Divortio | silesia | ooffice | 0.33 | 361.3 ms | 16.2 MB/s |
| v8.js.fflate | silesia | xml | 0.87 | 383.2 ms | 13.3 MB/s |
| v8.js.fflate | silesia | webster | 0.70 | 4476.7 ms | 8.8 MB/s |
| v8.js.fflate | silesia | dickens | 0.61 | 1195.5 ms | 8.1 MB/s |
| v8.js.fflate | silesia | x-ray | 0.30 | 1091.6 ms | 7.4 MB/s |
| v8.js.fflate | silesia | nci | 0.90 | 4708.7 ms | 6.8 MB/s |
| v8.js.fflate | silesia | mr | 0.64 | 1662.8 ms | 5.7 MB/s |
| v8.js.fflate | silesia | osdb | 0.62 | 1944.7 ms | 4.9 MB/s |
| v8.js.fflate | silesia | samba | 0.74 | 5014.9 ms | 4.1 MB/s |
| v8.js.fflate | silesia | reymont | 0.71 | 1564.3 ms | 4.0 MB/s |
| v8.js.fflate | silesia | mozilla | 0.62 | 14639.3 ms | 3.3 MB/s |
| v8.js.fflate | silesia | sao | 0.25 | 2408.3 ms | 2.9 MB/s |
| v8.js.fflate | silesia | ooffice | 0.49 | 2460.7 ms | 2.4 MB/s |


%mdSummary%

## Visualizations
> Throughput comparison.

```mermaid
xychart-beta
    title "throughput Comparison"
    x-axis "Library" ["v8.js.lz4Divortio", "v8.js.fflate"]
    y-axis "throughput" [0, 10]
    bar [0, 0]
```

---


## Detailed Results
> Complete breakdown of performance metrics.

| startTime | File | Library | inputSize | outputSize | Ratio | Duration (ms) | Throughput |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-01-12T04:43:57.458-05:00 | xml | v8.js.lz4Divortio | 5.1 MB | 1.21 MB | 0.76 | 38.796 | 132.07 MB/s |
| 2026-01-12T04:40:18.710-05:00 | mr | v8.js.lz4Divortio | 9.51 MB | 5.38 MB | 0.43 | 163.606 | 59.89 MB/s |
| 2026-01-12T04:38:37.137-05:00 | dickens | v8.js.lz4Divortio | 9.72 MB | 6.02 MB | 0.38 | 258.397 | 39.35 MB/s |
| 2026-01-12T04:43:48.844-05:00 | x-ray | v8.js.lz4Divortio | 8.08 MB | 7.53 MB | 0.07 | 260.249 | 32.03 MB/s |
| 2026-01-12T04:41:43.998-05:00 | reymont | v8.js.lz4Divortio | 6.32 MB | 3.36 MB | 0.47 | 268.961 | 25.33 MB/s |
| 2026-01-12T04:40:31.928-05:00 | nci | v8.js.lz4Divortio | 32 MB | 5.59 MB | 0.83 | 369.817 | 89.62 MB/s |
| 2026-01-12T04:43:58.277-05:00 | xml | v8.js.fflate | 5.1 MB | 690.34 KB | 0.87 | 408.274 | 13.18 MB/s |
| 2026-01-12T04:42:39.941-05:00 | sao | v8.js.lz4Divortio | 6.92 MB | 6.12 MB | 0.12 | 410.408 | 17.02 MB/s |
| 2026-01-12T04:41:05.047-05:00 | ooffice | v8.js.lz4Divortio | 5.87 MB | 3.94 MB | 0.33 | 419.914 | 14.68 MB/s |
| 2026-01-12T04:41:26.513-05:00 | osdb | v8.js.lz4Divortio | 9.62 MB | 4.57 MB | 0.52 | 475.692 | 21.06 MB/s |
| 2026-01-12T04:41:59.195-05:00 | samba | v8.js.lz4Divortio | 20.61 MB | 7.56 MB | 0.63 | 776.231 | 29.38 MB/s |
| 2026-01-12T04:38:49.346-05:00 | mozilla | v8.js.lz4Divortio | 48.85 MB | 24.8 MB | 0.49 | 948.721 | 53.03 MB/s |
| 2026-01-12T04:43:52.285-05:00 | x-ray | v8.js.fflate | 8.08 MB | 5.69 MB | 0.30 | 1014.551 | 8.15 MB/s |
| 2026-01-12T04:43:02.854-05:00 | webster | v8.js.lz4Divortio | 39.54 MB | 19.13 MB | 0.52 | 1103.269 | 36.61 MB/s |
| 2026-01-12T04:38:41.056-05:00 | dickens | v8.js.fflate | 9.72 MB | 3.77 MB | 0.61 | 1323.951 | 7.56 MB/s |
| 2026-01-12T04:41:50.281-05:00 | reymont | v8.js.fflate | 6.32 MB | 1.82 MB | 0.71 | 1468.037 | 4.44 MB/s |
| 2026-01-12T04:40:22.712-05:00 | mr | v8.js.fflate | 9.51 MB | 3.45 MB | 0.64 | 1683.867 | 5.72 MB/s |
| 2026-01-12T04:41:33.602-05:00 | osdb | v8.js.fflate | 9.62 MB | 3.61 MB | 0.62 | 1944.898 | 5.09 MB/s |
| 2026-01-12T04:42:47.252-05:00 | sao | v8.js.fflate | 6.92 MB | 5.16 MB | 0.25 | 2543.164 | 2.82 MB/s |
| 2026-01-12T04:41:12.076-05:00 | ooffice | v8.js.fflate | 5.87 MB | 2.98 MB | 0.49 | 2655.250 | 2.38 MB/s |
| 2026-01-12T04:40:40.471-05:00 | nci | v8.js.fflate | 32 MB | 3.22 MB | 0.90 | 4744.994 | 6.81 MB/s |
| 2026-01-12T04:43:23.057-05:00 | webster | v8.js.fflate | 39.54 MB | 11.93 MB | 0.70 | 5035.714 | 8.24 MB/s |
| 2026-01-12T04:42:13.787-05:00 | samba | v8.js.fflate | 20.61 MB | 5.28 MB | 0.74 | 5041.772 | 4.11 MB/s |
| 2026-01-12T04:39:06.611-05:00 | mozilla | v8.js.fflate | 48.85 MB | 18.44 MB | 0.62 | 14334.099 | 3.64 MB/s |

---



*Report generated by Divortio Benchmarking Suite.*


/**
 * @fileoverview Pure JavaScript Memory Throughput Benchmark for LZ4 patterns.
 * * V8 OPTIMIZATION LEVEL: MAXIMUM (Manual Inlining & SMI Enforcement)
 * * METRICS:
 * 1. wildMemcpy: Raw sequential write speed (The absolute limit).
 * 2. nativeMemcpy: V8 intrinsic baseline.
 * 3. naiveMemcpy: Unoptimized baseline.
 * 4. LZ4 Compress: Input Scanning speed + Sparse Writes.
 * 5. LZ4 Decompress: Output Generation speed.
 * 6. Read U32/U64: Unaligned Read throughput.
 * 7. Match Extension: Comparison speed.
 * 8. Write/Copy: Block write throughput.
 * 9. LZ4 Compress (Full DataView): The final integration test.
 */

// -----------------------------------------------------------------------------
// Constants & Configuration
// -----------------------------------------------------------------------------

export const WILD_COPY_OVERWRITE_BYTES = 8;
export const DEFAULT_SAMPLES = 50;
export const DEFAULT_WARMUPS = 15;
export const DEFAULT_SIZE = 4 * 1024 * 1024;

const LZ4_HASHTABLE_SIZE = 4096;

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function toLocalISOString(date) {
    const tzo = -date.getTimezoneOffset();
    const dif = tzo >= 0 ? '+' : '-';
    const pad = (num) => (num < 10 ? '0' : '') + num;
    const pad3 = (num) => (num < 10 ? '00' : num < 100 ? '0' : '') + num;

    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        '.' + pad3(date.getMilliseconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
}

function getMedian(values) {
    if (values.length === 0) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// -----------------------------------------------------------------------------
// Primitives
// -----------------------------------------------------------------------------

export function wildMemcpy(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    const end = (dstOffset + length) | 0;
    let d = dstOffset | 0;
    let s = srcOffset | 0;

    do {
        dst[d    ] = src[s    ];
        dst[d + 1] = src[s + 1];
        dst[d + 2] = src[s + 2];
        dst[d + 3] = src[s + 3];
        dst[d + 4] = src[s + 4];
        dst[d + 5] = src[s + 5];
        dst[d + 6] = src[s + 6];
        dst[d + 7] = src[s + 7];
        d = (d + 8) | 0;
        s = (s + 8) | 0;
    } while (d < end);
}

export function nativeMemcpy(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    dst.set(src.subarray(srcOffset, srcOffset + length), dstOffset);
}

export function naiveMemcpy(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    const len = length | 0;
    let d = dstOffset | 0;
    let s = srcOffset | 0;

    for (let i = 0; i < len; i = (i + 1) | 0) {
        dst[d + i] = src[s + i];
    }
}

export function benchFloat64Copy(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    const f64dst = new Float64Array(dst.buffer, dst.byteOffset + dstOffset, length / 8);
    const f64src = new Float64Array(src.buffer, src.byteOffset + srcOffset, length / 8);

    const len = f64dst.length;
    for (let i = 0; i < len; i = (i + 1) | 0) {
        f64dst[i] = f64src[i];
    }
}

export function readU32(buf, i) {
    return (buf[i] | (buf[i+1] << 8) | (buf[i+2] << 16) | (buf[i+3] << 24));
}

// -----------------------------------------------------------------------------
// Read/Write Benchmarks
// -----------------------------------------------------------------------------

export function benchReadU32Bitwise(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    let ip = srcOffset | 0;
    const limit = (srcOffset + length - 4) | 0;
    let check = 0;
    while (ip < limit) {
        check ^= (src[ip] | (src[ip+1] << 8) | (src[ip+2] << 16) | (src[ip+3] << 24));
        ip = (ip + 1) | 0;
    }
    dst[dstOffset] = check & 0xFF;
}

export function benchReadU32DataView(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    let ip = srcOffset | 0;
    const limit = (srcOffset + length - 4) | 0;
    let check = 0;
    const view = new DataView(src.buffer, src.byteOffset, src.byteLength);

    while (ip < limit) {
        check ^= view.getUint32(ip, true);
        ip = (ip + 1) | 0;
    }
    dst[dstOffset] = check & 0xFF;
}

/**
 * 64-bit Read (DataView).
 * Does fetching 8 bytes per loop offer better throughput than 4 bytes?
 */
export function benchReadU64DataView(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    let ip = srcOffset | 0;
    const limit = (srcOffset + length - 8) | 0;
    let check = 0n; // BigInt accumulator
    const view = new DataView(src.buffer, src.byteOffset, src.byteLength);

    while (ip < limit) {
        check = check ^ view.getBigUint64(ip, true);
        ip = (ip + 1) | 0;
    }
    // No-op write to prevent DCE
    dst[dstOffset] = Number(check & 0xFFn);
}

export function benchWriteU32DataView(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    const view = new DataView(dst.buffer, dst.byteOffset, dst.byteLength);
    let d = dstOffset | 0;
    const limit = (dstOffset + length - 4) | 0;
    const val = 0xDEADBEEF;

    while (d < limit) {
        view.setUint32(d, val, true);
        d = (d + 4) | 0;
    }
}

export function benchWriteU64DataView(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    const view = new DataView(dst.buffer, dst.byteOffset, dst.byteLength);
    let d = dstOffset | 0;
    const limit = (dstOffset + length - 8) | 0;
    const val = 0xDEADBEEFDEADBEEFn;

    while (d < limit) {
        view.setBigUint64(d, val, true);
        d = (d + 8) | 0;
    }
}

export function benchCopyU64DataView(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    const srcView = new DataView(src.buffer, src.byteOffset, src.byteLength);
    const dstView = new DataView(dst.buffer, dst.byteOffset, dst.byteLength);
    let s = srcOffset | 0;
    let d = dstOffset | 0;
    const limit = (dstOffset + length - 8) | 0;

    while (d < limit) {
        const val = srcView.getBigUint64(s, true);
        dstView.setBigUint64(d, val, true);
        s = (s + 8) | 0;
        d = (d + 8) | 0;
    }
}

// -----------------------------------------------------------------------------
// Match Extension
// -----------------------------------------------------------------------------

export function benchMatchByte(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    let s = srcOffset | 0;
    const limit = (srcOffset + length - 8) | 0;
    let m = (s + 1) | 0;

    while (s < limit) {
        if ((s & 127) === 0) { s++; m++; continue; }
        if (src[s] === src[m]) { s++; m++; } else { s++; m++; }
    }
    dst[dstOffset] = s & 0xFF;
}

/**
 * U32 DataView Match.
 * Compares 4 bytes at a time using the fast getUint32 intrinsic.
 * * No BigInt allocation overhead.
 * * No manual bitwise overhead.
 */
export function benchMatchU32DataView(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    let s = srcOffset | 0;
    const limit = (srcOffset + length - 8) | 0;
    let m = (s + 1) | 0;
    const view = new DataView(src.buffer, src.byteOffset, src.byteLength);

    while (s < limit) {
        // Simulate mismatch break periodically to match other tests
        if ((s & 127) === 0) { s++; m++; continue; }

        // FAST BATCH CHECK
        if (view.getUint32(s, true) === view.getUint32(m, true)) {
            s = (s + 4) | 0;
            m = (m + 4) | 0;
        } else {
            // In reality we would fall back to byte scan here.
            s++; m++;
        }
    }
    dst[dstOffset] = s & 0xFF;
}

export function benchMatchWord(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    let s = srcOffset | 0;
    const limit = (srcOffset + length - 8) | 0;
    let m = (s + 1) | 0;

    while (s < limit) {
        if ((s & 127) === 0) { s++; m++; continue; }

        // Manual Word construction (Previous "Slow" implementation)
        const v1 = (src[s] | (src[s+1] << 8) | (src[s+2] << 16) | (src[s+3] << 24));
        const v2 = (src[m] | (src[m+1] << 8) | (src[m+2] << 16) | (src[m+3] << 24));

        if (v1 === v2) {
            s = (s + 4) | 0; m = (m + 4) | 0;
        } else {
            s++; m++;
        }
    }
    dst[dstOffset] = s & 0xFF;
}

/**
 * 64-bit DataView Match.
 * Compares 8 bytes at a time using getBigUint64.
 */
export function benchMatchU64(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    let s = srcOffset | 0;
    const limit = (srcOffset + length - 8) | 0;
    let m = (s + 1) | 0;
    const view = new DataView(src.buffer, src.byteOffset, src.byteLength);

    while (s < limit) {
        if ((s & 127) === 0) { s++; m++; continue; }

        // FAST CHECK
        if (view.getBigUint64(s, true) === view.getBigUint64(m, true)) {
            s = (s + 8) | 0;
            m = (m + 8) | 0;
        } else {
            // Mismatch found, we advance just 1 byte to simulate "finding the end"
            // In real compression, we would switch to a byte loop here.
            s++; m++;
        }
    }
    dst[dstOffset] = s & 0xFF;
}

// -----------------------------------------------------------------------------
// Compression Variations
// -----------------------------------------------------------------------------

export function benchLz4MemcpyCompress(dst, dstOffset, src, srcOffset, length, hashTable) {
    let ip = srcOffset | 0;
    let op = dstOffset | 0;
    const limit = (srcOffset + length - 8) | 0;
    while (ip < limit) {
        let check = (src[ip] | (src[ip+1] << 8) | (src[ip+2] << 16) | (src[ip+3] << 24));
        if ((ip & 7) === 0) {
            for (let k = 0; k < 8; k = (k + 1) | 0) { dst[op + k] = src[ip + k]; }
            op = (op + 8) | 0; ip = (ip + 4) | 0;
        } else { ip = (ip + 1) | 0; }
    }
}

export function benchLz4MemcpyCompress8(dst, dstOffset, src, srcOffset, length, hashTable) {
    let ip = srcOffset | 0;
    let op = dstOffset | 0;
    const limit = (srcOffset + length - 8) | 0;
    while (ip < limit) {
        let check = (src[ip] | (src[ip+1] << 8) | (src[ip+2] << 16) | (src[ip+3] << 24));
        if ((ip & 7) === 0) {
            dst[op] = src[ip]; dst[op+1] = src[ip+1]; dst[op+2] = src[ip+2]; dst[op+3] = src[ip+3];
            dst[op+4] = src[ip+4]; dst[op+5] = src[ip+5]; dst[op+6] = src[ip+6]; dst[op+7] = src[ip+7];
            op = (op + 8) | 0; ip = (ip + 4) | 0;
        } else { ip = (ip + 1) | 0; }
    }
}

export function benchLz4MemcpyCompressDataView(dst, dstOffset, src, srcOffset, length, hashTable) {
    let ip = srcOffset | 0;
    let op = dstOffset | 0;
    const limit = (srcOffset + length - 8) | 0;
    const view = new DataView(src.buffer, src.byteOffset, src.byteLength);

    while (ip < limit) {
        let check = view.getUint32(ip, true);
        if ((ip & 7) === 0) {
            dst[op] = src[ip]; dst[op+1] = src[ip+1]; dst[op+2] = src[ip+2]; dst[op+3] = src[ip+3];
            dst[op+4] = src[ip+4]; dst[op+5] = src[ip+5]; dst[op+6] = src[ip+6]; dst[op+7] = src[ip+7];
            op = (op + 8) | 0; ip = (ip + 4) | 0;
        } else { ip = (ip + 1) | 0; }
    }
}

export function benchLz4MemcpyCompressDataViewWrite(dst, dstOffset, src, srcOffset, length, hashTable) {
    let ip = srcOffset | 0;
    let op = dstOffset | 0;
    const limit = (srcOffset + length - 8) | 0;

    const srcView = new DataView(src.buffer, src.byteOffset, src.byteLength);
    const dstView = new DataView(dst.buffer, dst.byteOffset, dst.byteLength);

    while (ip < limit) {
        let check = srcView.getUint32(ip, true);

        if ((ip & 7) === 0) {
            dstView.setBigUint64(op, srcView.getBigUint64(ip, true), true);
            op = (op + 8) | 0;
            ip = (ip + 4) | 0;
        } else {
            ip = (ip + 1) | 0;
        }
    }
}

export function benchLz4MemcpyDecompress(dst, dstOffset, src, srcOffset, length, _unusedCtx) {
    let dPos = dstOffset | 0;
    let sPos = srcOffset | 0;
    const dEnd = (dstOffset + length) | 0;
    const LITERAL_LEN = 8; const MATCH_LEN = 8;

    while (dPos < dEnd) {
        dst[dPos] = src[sPos]; dst[dPos+1] = src[sPos+1]; dst[dPos+2] = src[sPos+2]; dst[dPos+3] = src[sPos+3];
        dst[dPos+4] = src[sPos+4]; dst[dPos+5] = src[sPos+5]; dst[dPos+6] = src[sPos+6]; dst[dPos+7] = src[sPos+7];
        dPos = (dPos + LITERAL_LEN) | 0; sPos = (sPos + LITERAL_LEN) | 0;
        if (dPos >= dEnd) break;
        const offset = ((sPos & 0xFFFF) + 1) | 0;
        let matchPos = (dPos - offset) | 0; if (matchPos < 0) matchPos = 0;
        dst[dPos] = dst[matchPos]; dst[dPos+1] = dst[matchPos+1]; dst[dPos+2] = dst[matchPos+2]; dst[dPos+3] = dst[matchPos+3];
        dst[dPos+4] = dst[matchPos+4]; dst[dPos+5] = dst[matchPos+5]; dst[dPos+6] = dst[matchPos+6]; dst[dPos+7] = dst[matchPos+7];
        dPos = (dPos + MATCH_LEN) | 0;
    }
}

// -----------------------------------------------------------------------------
// Benchmark Runner
// -----------------------------------------------------------------------------

function runBenchmarkInternal(library, operation, fn, size, samples, warmups) {
    const src = new Uint8Array(size + 128);
    const dst = new Uint8Array(size + 128);
    const hashTable = new Int32Array(LZ4_HASHTABLE_SIZE);

    for (let i = 0; i < size; i++) { src[i] = (i & 255); }

    for (let i = 0; i < warmups; i++) { fn(dst, 0, src, 0, size, hashTable); }

    const start = new Date();
    const sampleDurations = new Float64Array(samples);

    for (let i = 0; i < samples; i++) {
        const t0 = performance.now();
        fn(dst, 0, src, 0, size, hashTable);
        const t1 = performance.now();
        sampleDurations[i] = t1 - t0;
    }

    const medianDuration = getMedian(Array.from(sampleDurations));
    const mbs = (size / 1048576) / (medianDuration / 1000);

    return { library, operation, startTime: start.getTime(), startDTZ: toLocalISOString(start), bytes: size, numSample: samples, numWarmup: warmups, duration: parseFloat(medianDuration.toFixed(6)), MBs: parseFloat(mbs.toFixed(2)) };
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export function runWildBenchmark(s, sm, w) { return runBenchmarkInternal('memcpy', 'sequential', wildMemcpy, s, sm, w); }
export function runFloat64Benchmark(s, sm, w) { return runBenchmarkInternal('memcpy', 'wide-64', benchFloat64Copy, s, sm, w); }
export function runNativeBenchmark(s, sm, w) { return runBenchmarkInternal('memcpy', 'native', nativeMemcpy, s, sm, w); }
export function runNaiveBenchmark(s, sm, w) { return runBenchmarkInternal('memcpy', 'loop', naiveMemcpy, s, sm, w); }
export function runReadU32Bitwise(s, sm, w) { return runBenchmarkInternal('read-u32', 'bitwise', benchReadU32Bitwise, s, sm, w); }
export function runReadU32DataView(s, sm, w) { return runBenchmarkInternal('read-u32', 'dataview', benchReadU32DataView, s, sm, w); }
export function runReadU64DataView(s, sm, w) { return runBenchmarkInternal('read-u64', 'dataview', benchReadU64DataView, s, sm, w); }
export function runWriteU32DataView(s, sm, w) { return runBenchmarkInternal('write-u32', 'dataview', benchWriteU32DataView, s, sm, w); }
export function runWriteU64DataView(s, sm, w) { return runBenchmarkInternal('write-u64', 'dataview', benchWriteU64DataView, s, sm, w); }
export function runCopyU64DataView(s, sm, w) { return runBenchmarkInternal('copy-u64', 'dataview', benchCopyU64DataView, s, sm, w); }
export function runMatchByte(s, sm, w) { return runBenchmarkInternal('match-ext', 'byte-loop', benchMatchByte, s, sm, w); }
export function runMatchWord(s, sm, w) { return runBenchmarkInternal('match-ext', 'word-loop', benchMatchWord, s, sm, w); }
export function runMatchU32DataView(s, sm, w) { return runBenchmarkInternal('match-ext', 'u32-dataview', benchMatchU32DataView, s, sm, w); } // NEW
export function runMatchU64(s, sm, w) { return runBenchmarkInternal('match-ext', 'u64-loop', benchMatchU64, s, sm, w); }
export function runLz4CompressBenchmark(s, sm, w) { return runBenchmarkInternal('memcpy', 'lz4-compress', benchLz4MemcpyCompress, s, sm, w); }
export function runLz4CompressBenchmark8(s, sm, w) { return runBenchmarkInternal('memcpy', 'lz4-compress-8', benchLz4MemcpyCompress8, s, sm, w); }
export function runLz4CompressBenchmarkDataView(s, sm, w) { return runBenchmarkInternal('memcpy', 'lz4-compress-dataview', benchLz4MemcpyCompressDataView, s, sm, w); }
export function runLz4CompressBenchmarkDataViewWrite(s, sm, w) { return runBenchmarkInternal('memcpy', 'lz4-compress-dataview-write', benchLz4MemcpyCompressDataViewWrite, s, sm, w); }
export function runLz4DecompressBenchmark(s, sm, w) { return runBenchmarkInternal('memcpy', 'lz4-decompress', benchLz4MemcpyDecompress, s, sm, w); }

export function runAllBenchmarks(size = DEFAULT_SIZE, samples = DEFAULT_SAMPLES, warmups = DEFAULT_WARMUPS) {
    const results = [
        runWildBenchmark(size, samples, warmups),
        runFloat64Benchmark(size, samples, warmups),
        runNativeBenchmark(size, samples, warmups),
        runNaiveBenchmark(size, samples, warmups),
        runReadU32Bitwise(size, samples, warmups),
        runReadU32DataView(size, samples, warmups),
        runReadU64DataView(size, samples, warmups),
        runWriteU32DataView(size, samples, warmups),
        runWriteU64DataView(size, samples, warmups),
        runCopyU64DataView(size, samples, warmups),
        runMatchByte(size, samples, warmups),
        runMatchWord(size, samples, warmups),
        runMatchU32DataView(size, samples, warmups), // NEW
        runMatchU64(size, samples, warmups),
        runLz4CompressBenchmark(size, samples, warmups),
        runLz4CompressBenchmark8(size, samples, warmups),
        runLz4CompressBenchmarkDataView(size, samples, warmups),
        runLz4CompressBenchmarkDataViewWrite(size, samples, warmups),
        runLz4DecompressBenchmark(size, samples, warmups)
    ];
    return results.sort((a, b) => b.MBs - a.MBs);
}

export default {
    // ... (Full export list implicit)
    wildMemcpy, nativeMemcpy, naiveMemcpy, benchFloat64Copy, benchReadU32Bitwise, benchReadU32DataView, benchReadU64DataView, benchMatchByte, benchMatchWord, benchMatchU32DataView, benchMatchU64,
    benchWriteU32DataView, benchWriteU64DataView, benchCopyU64DataView,
    benchLz4MemcpyCompress, benchLz4MemcpyCompress8, benchLz4MemcpyCompressDataView, benchLz4MemcpyCompressDataViewWrite, benchLz4MemcpyDecompress,
    runWildBenchmark, runFloat64Benchmark, runNativeBenchmark, runNaiveBenchmark,
    runReadU32Bitwise, runReadU32DataView, runReadU64DataView,
    runWriteU32DataView, runWriteU64DataView, runCopyU64DataView,
    runMatchByte, runMatchWord, runMatchU32DataView, runMatchU64,
    runLz4CompressBenchmark, runLz4CompressBenchmark8, runLz4CompressBenchmarkDataView, runLz4CompressBenchmarkDataViewWrite, runLz4DecompressBenchmark, runAllBenchmarks,
    DEFAULT_SAMPLES, DEFAULT_WARMUPS, DEFAULT_SIZE
};
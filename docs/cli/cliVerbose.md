# CLI Verbose Output (`--verbose` / `-v`)

The `--verbose` flag enables detailed, human-readable console logging for compression and decompression operations. It provides a step-by-step breakdown of the pipeline, including file paths, sizes, and performance metrics.

## Usage
```bash
node src/lz4CLI.js <compress|decompress> <file> --verbose
```

## Example Output (Compression)
```text
Command: node src/lz4CLI.js compress big_test.bin -o big_test.lz4 -v
Input: "/Users/moe/antigravity/divortio-lz4-v8/big_test.bin" (1.0 MB)
Read: 1.0 MB to Buffer in 0.812ms (1260.9 MB/s)
Compress: 1.0 MB to 1.0 MB in 2.341ms (437.2 MB/s), +0.0% in size.
Wrote: 1.0 MB to File in 1.450ms (706.1 MB/s)
Processed: 1.0 MB to 1.0 MB (+0.0%) in 5.612ms (182.4 MB/s)
Output: "/Users/moe/antigravity/divortio-lz4-v8/big_test.lz4"
```

## Example Output (Decompression)
```text
Command: node src/lz4CLI.js decompress big_test.lz4 -o big_test_out.bin -v
Input: "/Users/moe/antigravity/divortio-lz4-v8/big_test.lz4" (1.0 MB)
Read: 1.0 MB to Buffer in 0.443ms (2316.5 MB/s)
Decompress: 1.0 MB to 1.0 MB in 1.120ms (914.7 MB/s), -0.0% in size.
Wrote: 1.0 MB to File in 1.230ms (832.9 MB/s)
Processed: 1.0 MB to 1.0 MB (-0.0%) in 4.102ms (249.8 MB/s)
Output: "/Users/moe/antigravity/divortio-lz4-v8/big_test_out.bin"
```

## Metrics Explanation
*   **Input/Output**: Shows the absolute path and human-readable file size (e.g., `1.0 MB`).
*   **Read**: Time and throughput to read the input file into memory.
*   **Compress/Decompress**: Time and throughput for the core LZ4 operation.
    *   **Throughput**: Calculated based on the input size processed per second.
    *   **Ratio**: Percentage change in size (Negative = Compression, Positive = Expansion).
*   **Wrote**: Time and throughput to write the result to disk.
*   **Processed**: Total end-to-end duration and throughput (Wall Clock Time).

## See Also
*   [cliJSON.md](cliJSON.md) / [cliLog.md](cliLog.md) - Machine-readable output.
*   [cliCompress.md](cliCompress.md) / [cliDecompress.md](cliDecompress.md) - Usage commands.

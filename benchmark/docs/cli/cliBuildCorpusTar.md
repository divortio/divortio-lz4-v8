# Technical: Out-of-Process Corpus Tar Generation

This document details the architecture for generating concatenated corpus tarballs (`.tar` / `.all`) used in throughput benchmarking.

## The Problem

Concatenating large corpus files into a single buffer or stream within the main benchmark process introduces:
1.  **Memory Pressure**: Loading 200MB+ into Node.js buffers before the benchmark starts can skew GC metrics.
2.  **Event Loop Blocking**: Synchronous file reading/writing blocks the tick.
3.  **State Contamination**: The benchmark process should start with a clean state, not one dirtied by heavy IO operations.

## The Solution

We implement an **Out-of-Process** generation strategy.

### Architecture

1.  **Request**: The user requests `-c silesia.tar`.
2.  **Spawn**: The main process (`corpusTar.js`) spawns a dedicated child process executing `tarCorpus.js`.
3.  **Generate**: 
    *   The child process locates the corpus in `.cacheCorpus/corpus/silesia`.
    *   It executes `tar -cf silesia.tar *` (using native `tar` where available for speed) inside that directory.
    *   It outputs the final path and size as JSON to STDOUT.
4.  **Handover**: The main process reads the JSON, verifying the file exists.
5.  **Ownership**: 
    *   The child process exits (without deleting the file).
    *   The main process registers a `process.on('exit')` handler to delete the file.
6.  **Benchmark**: The benchmark runs against the physical `.tar` file as if it were a standard input file.
7.  **Cleanup**: When the benchmark finishes (or crashes), the cleanup handler ensures the `.tar` file is removed.

## Benefits

*   **Isolation**: The benchmark process memory remains clean.
*   **Efficiency**: Uses native `tar` (when available) which is optimized for this task.
*   **Safety**: Automatic cleanup prevents disk bloat.

#!/bin/bash

# benchmark/examples/compress/ex_compress.lz4-divortio.silesia.sh
# 
# Example: Running a compression benchmark using LZ4 (Divortio) against the Silesia corpus.
# This script is location-agnostic.

# Resolve the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Resolve path to bench.js (2 levels up)
BENCH_SCRIPT="$DIR/../../bench.js"

echo "Running benchmark from: $BENCH_SCRIPT"

# Execute
node "$BENCH_SCRIPT" compress \
    --corpus silesia \
    --library lz4Divortio \
    --samples 5 \
    --warmup 2

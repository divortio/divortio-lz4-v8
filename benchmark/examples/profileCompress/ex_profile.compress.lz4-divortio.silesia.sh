#!/bin/bash
# benchmark/examples/profileCompress/ex_profile.compress.lz4-divortio.silesia.sh

# This script runs a profile of lz4Divortio compression on the Silesia corpus.

# Determine the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Go to benchmark root (3 levels up)
cd "$SCRIPT_DIR/../../.."

echo "Starting Profile..."

# Run the profile command
# -l lz4Divortio: The library to profile
# -c silesia: The corpus to use
# -s 5: 5 samples
# -w 2: 2 warmups

node benchmark/bench.js profile compress \
  -l lz4Divortio \
  -c silesia \
  -s 5 \
  -w 2

echo "Done."

# Profile CLI Command (`bench.js profile`)

Profile benchmark operations using Node.js `--prof` without the overhead of benchmark measurement.

## Usage

```bash
node benchmark/bench.js profile <command> [options]
```

**Commands:**
- `compress`
- `decompress`
- `roundtrip`

**Options:**
- `-l, --library <lib>`: (Required) Single library to profile.
- `-i, --input <file>`: Input file(s).
- `-c, --corpus <name>`: Corpus name(s).
- `-s, --samples <n>`: Number of samples to listLibs (to generate sufficient ticks).
- `-w, --warmups <n>`: Number of warmups.
- `--log <file>`: (Optional) Override output log filename.
- `--diagnostic-dir <dir>`: (Optional) Override output directory.

## Output

Profiles are generated in `/.cacheCorpus/profile/<library_safe_name>/`.
Two files are generated:
1. **Tick Log**: `profTick_<lib>_<timestamp>.v8.log` (Raw V8 tick log)
2. **Processed JSON**: `profTickProc_<lib>_<timestamp>.v8.log.json` (Processed via `--prof-process --preprocess -j`)
3. **Processed Text**: `profTickProc_<lib>_<timestamp>.txt` (Human readable summary)

## Architecture

The profile command wraps the existing benchmark scripts but executes them in a spawned process with:
`node --prof --no-logfile-per-isolate --logfile=... ...`

This ensures that the code path being profiled is identical to the benchmark, but the benchmark measurement logic is ignored in favor of V8 profiling.

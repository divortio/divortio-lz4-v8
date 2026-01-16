# CLI Reporting: JSON

The JSON reporter outputs the raw serialized `BenchResults` object. This is ideal for programmatic consumption, archival, or passing data to other visualization tools.

## Usage

Use `-f json` or specify a `.json` output file.

```bash
node benchmark/bench.js compress ... -f json
node benchmark/bench.js compress ... -o my_results.json
```

## Structure

The output is a JSON object containing:
-   `config`: Benchmark configuration (libraries, inputs, samples).
-   `sysInfo`: System information (CPU, OS).
-   `results`: Key-value map of performance metrics per library/file.
-   `startTime` / `endTime`: Execution timestamps.

## Appending

If `--append` is used with a valid JSON file, the CLI treats the file as an array of benchmark runs.

1.  Reads existing file.
2.  Parses as JSON.
3.  Calculates if it is an Array or Object.
4.  Pushes new result object to the array (converting single object to array if needed).
5.  Writes file back.

```bash
# First run
node benchmark/bench.js ... -o log.json

# Second run (appends)
node benchmark/bench.js ... -o log.json --append
```

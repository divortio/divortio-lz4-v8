/**
 * benchmark/src/cli/cliHelp.js
 * 
 * Displays help information for the Benchmark CLI.
 */

export function showHelp(command) {
  if (command === 'libs' || command === 'libraries') {
    console.log(`
  Usage: node benchmark/bench.js libs [filter] [options]

  Description:
    Lists available benchmark libraries.
    
  Arguments:
    [filter]                Optional positional argument to filter libraries by name (includes wildcard support '*').

  Options:
    --env, --environment <name>  Filter by environment (e.g. 'node', 'v8').
    --lang, --language <name>    Filter by language (e.g. 'js', 'wasm').
    -h, --help                   Show this help message.

  Examples:
    node benchmark/bench.js libs
    node benchmark/bench.js libs lz4
    node benchmark/bench.js libs --env node
        `);
    return;
  }

  if (command === 'corpus' || command === 'corpora') {
    console.log(`
  Usage: node benchmark/bench.js corpus [filter] [options]

  Description:
    Lists available corpus files and sizes.

  Arguments:
    [filter]                Optional positional argument to filter by corpus or file name.

  Options:
    -h, --help              Show this help message.

  Examples:
    node benchmark/bench.js corpus
    node benchmark/bench.js corpus silesia
        `);
    return;
  }

  if (command === 'listCorpora') {
    console.log(`
  Usage: node benchmark/bench.js list <type> [options]

  Types:
    libs, libraries         List available libraries.
    corpus, corpora         List available corpora.
    
  Options:
    -h, --help              Show this help message.
        `);
    return;
  }

  console.log(`
  Usage: node benchmark/bench.js <command> [options]

  Commands:
    compress      Run compression benchmarks
    decompress    Run decompression benchmarks
    roundtrip     Run roundtrip (compress -> decompress) benchmarks
    libs          List available libraries
    corpus        List available corpus files
    profile       Profile operations (compress, decompress, roundtrip) without benchmark measurement

  Options:
    -l, --library <name>    Library to test (e.g. v8.js.lz4Divortio, pako). Can be repeated.
    -i, --input <path>      Input file path. Can be repeated.
    -c, --corpus <name>     Corpus name (e.g. silesia). Can be repeated.
    -s, --samples <n>       Number of samples per test (default: 5).
    -w, --warmup <n>        Number of warmup runs (default: 2).
    -f, --format <type>     Report format: md, json, csv, tsv. (Default: md)
    -o, --output <path>     Output file path (explicit filename or directory).
    --dir <path>            Explicit output directory.
    --prefix <str>          Filename prefix.
    --append                Append to existing report files.
    --no-header             Omit headers (for CSV/TSV appending).
    --environment <name>    Filter libraries by environment (e.g. node).
    --language <name>       Filter libraries by language (e.g. js).
    --dry-run               Validate configuration without running benchmarks.
    -h, --help              Show this help message.

  Examples:
    node benchmark/bench.js compress -l v8.js.lz4Divortio -o results/my_bench.json
    node benchmark/bench.js libs --env node
`);
}

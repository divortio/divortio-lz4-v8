/**
 * src/cli/cliHelp.js
 * 
 * Displays rich help information for the LZ4-Divortio CLI.
 */

export function showHelp(command) {
    if (command === 'compress') {
        console.log(`
  Usage: node src/lz4CLI.js compress [options] <file>

  Description:
    Compresses a file using the LZ4 Frame format.
    Supports customization of block sizes, dictionary usage, and frame flags.

  Options:
    -o, --output <file>       Specify output filename. Defaults to <input>.lz4.
    -f, --force               Force overwrite of output file if it exists.
    -k, --keep                Keep input file (default).
    --rm                      Delete input file after successful compression.
    -v, --verbose             Enable verbose logging (compression ratio, time).

  Compression Configuration:
    -B, --block-size <n>      Set the maximum block size. Smaller blocks improve random access but reduce ratio.
                              Supported values: 64k, 256k, 1m, 4m. Default: 4MB (4m).
    -D, --dictionary <file>   Load an external dictionary file. Improves compression for small files.
    -i, --independent-blocks  Force blocks to be independent.
                              Required for random access/parallel decompression. Ratio impact: Low.
    --content-checksum        Compute and store a 32-bit checksum of the original uncompressed content (slows compression).
    --no-frame-content-size   Do not store the original content size in the header (saves 8 bytes).

  Examples:
    node src/lz4CLI.js compress data.bin
    node src/lz4CLI.js compress data.bin -B 64k --rm -o data.lz4
        `);
        return;
    }

    if (command === 'decompress') {
        console.log(`
  Usage: node src/lz4CLI.js decompress [options] <file>

  Description:
    Decompresses an LZ4 Frame file.
    Automatically detects block size and frame settings.

  Options:
    -o, --output <file>       Specify output filename. Defaults to input without .lz4 extension.
    -f, --force               Force overwrite of output file if it exists.
    -k, --keep                Keep input file (default).
    --rm                      Delete input file after successful decompression.
    -v, --verbose             Enable verbose logging.

  Decompression Configuration:
    -D, --dictionary <file>   Load an external dictionary file.
                              MUST match the dictionary used during compression, or decompression will fail.
    --verify-checksum         Calculate and verify the content checksum if present in the frame.
                              Default: false (fastest performance).

  Examples:
    node src/lz4CLI.js decompress data.lz4
    node src/lz4CLI.js -d data.lz4 --rm --verify-checksum
        `);
        return;
    }

    // Default / Global Help
    console.log(`
  Usage: node src/lz4CLI.js <command> [options] <file>

  Commands:
    compress (c)          Compress a file to LZ4 format.
    decompress (d)        Decompress an LZ4 file.

  Global Options:
    -h, --help            Show this help message.
    -v, --verbose         Enable verbose output.

  Run 'node src/lz4CLI.js <command> --help' for command-specific options.

  Examples:
    node src/lz4CLI.js compress large_file.log
    node src/lz4CLI.js decompress compressed.lz4 --verify-checksum
`);
}

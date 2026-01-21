# Block Module

[🏠 Home](../README.md) > Block

Location: [`src/block`](../../../src/block/)

The **Block** module contains the core compression and decompression algorithms (Kernels). These functions operate on raw buffers and offsets, implementing the [LZ4 Block Format](https://github.com/lz4/lz4/blob/dev/doc/lz4_Block_format.md).

## Files
-   [**blockCompress**](blockCompress.md): The compressor kernel.
-   [**blockDecompress**](blockDecompress.md): The decompressor kernel.
-   [**blockLiterals**](blockLiterals.md): Literal sequence encoding.
-   [**blockMatch**](blockMatch.md): Match sequence encoding.

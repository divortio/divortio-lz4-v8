# lz4.js

[🏠 Home](README.md) > lz4

Source: [`src/lz4.js`](../../src/lz4.js)

## Description
The main library entry point (Facade).

## API

### `LZ4.compress(input, dictionary, options)`
Synchronously compresses a buffer.

- **input**: `Uint8Array` | `Buffer` - Data to compress.
- **dictionary**: `Uint8Array` | `null` - Optional dictionary.
- **options**: `Object` (Optional)
    - `blockSize`: `number` (Default: 4MB) - Max block size.
    - `blockIndependence`: `boolean` (Default: false) - If true, blocks are independent.
    - `contentChecksum`: `boolean` (Default: false) - Add stream checksum.
    - `blockChecksum`: `boolean` (Default: false) - Add block checksums.
    - `addContentSize`: `boolean` (Default: true) - Add size to header.
    - **`acceleration`**: `number` (Default: 1) - Skip factor (1=High Ratio, >1=Faster).
    - **`compressionLevel`**: `number` (Legacy) - If Negative (e.g. -10), sets acceleration to 10.

### `LZ4.createCompressStream(dictionary, options)`
Creates a TransformStream for compression.

- **dictionary**: `Uint8Array` | `null`
- **options**: `Object`
    - Same as `compress`, plus stream specific flags.
    - `acceleration` supported.

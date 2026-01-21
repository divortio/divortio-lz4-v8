# LZ4-Divortio Documentation

Welcome to the technical documentation for the `lz4-divortio` library.
This index mirrors the source code structure at [`/src`](../../src/).

## Modules

### Core
-   [**Block**](block/README.md): Low-level block compression/decompression kernels.
-   [**Frame**](frame/README.md): LZ4 Frame format (header/footer) handling.
-   [**Buffer**](buffer/README.md): High-level full-buffer compression.
-   [**Stream**](stream/README.md): Web Streams API integration.

### Algorithms
-   [**xxHash32**](xxhash32/README.md): Checksum algorithm.
-   [**Dictionary**](dictionary/README.md): Dictionary support logic.

### Interface
-   [**CLI**](cli/README.md): Command-line interface tools.
-   [**WebWorker**](webWorker/README.md): Off-main-thread processing.

### Utils
-   [**Shared**](shared/README.md): Common utilities (types, low-level bits).
-   [**Utils**](utils/README.md): Byte manipulation helpers.

## Entrypoints
-   [**lz4.js**](lz4.md): Main library facade.
-   [**lz4CLI.js**](lz4CLI.md): CLI executable.

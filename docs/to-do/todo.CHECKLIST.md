# Checklist

[🏠 Home](../docs/src/README.md)

Prioritized listCorpora of next steps.

## High Priority (Spec & Bugs)
- [x] **Skippable Frames**: Fix crash on User Data frames. [Link](done/todo.spec.md)
- [x] **Block Checksums**: Implement verification. [Link](done/todo.spec.md)

- [x] Optimize `compressBlock` (Completed: Baseline V8 JIT is sufficient)
- [x] Optimize `decompressBlock` (Completed: Baseline V8 JIT is sufficient)
- [x] **Skippable Frames**: Fix crash on User Data frames. [Link](done/todo.spec.md)
- [x] **Block Checksums**: Implement verification (Buffer + Stream). [Link](done/todo.spec.md)
- [x] **Fuzz Testing**: Verify `decompressBlock` safety. [Link](done/todo.blockDecompress.md)
- [x] **Uint32 Reads**: Optimize `blockDecompress`. [Link](dev/profiling/silesia.dickens/decompress/docs/01_decompressBlock.dep-5.md) (Rejected)
- [x] **Aligned Access**: Optimize `xxHash32`. [Link](done/todo.xxhash32.md)
- [x] **External Dictionary**: Reduce memory copies. [Link](done/todo.dictionaryContext.md)
- [x] **Stream Buffering**: Implement Ring Buffer/Rope for `LZ4Encoder`. [Link](done/todo.streamCompress.md)

## Low Priority (Refactor)
- [x] **Stream Refactor**: Use `fs` streams in CLI. [Link](done/todo.cliCompress.md)
- [x] **Tree Shaking**: Split entrypoints. [Link](done/todo.entrypoints.md)
- [x] **Worker Pool**: Implement concurrent workers. [Link](done/todo.webWorker.md)

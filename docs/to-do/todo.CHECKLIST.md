# Checklist

[🏠 Home](../docs/src/README.md)

Prioritized list of next steps.

## High Priority (Spec & Bugs)
- [ ] **Skippable Frames**: Fix crash on User Data frames. [Link](todo.spec.md)
- [ ] **Block Checksums**: Implement verification. [Link](todo.spec.md)

## Critical Performance
- [ ] **Optimize `compressBlock`**: Fix "Interpreted" status (Monomorphism/Deopt). **(Yields ~59% improvement)**

## Medium Priority (Performance)
- [ ] **Uint32 Reads**: Optimize `blockDecompress`. [Link](todo.blockDecompress.md)
- [ ] **Aligned Access**: Optimize `xxHash32`. [Link](todo.xxhash32.md)
- [ ] **External Dictionary**: Reduce memory copies. [Link](todo.dictionaryContext.md)

## Low Priority (Refactor)
- [ ] **Stream Refactor**: Use `fs` streams in CLI. [Link](todo.cliCompress.md)
- [ ] **Tree Shaking**: Split entrypoints. [Link](todo.entrypoints.md)

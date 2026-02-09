# Todo: Acceleration

[🏠 Home](../src/README.md)

## Goal
Implement `acceleration` parameter in `compressBlock` to match reference LZ4 behavior.

## Reference Analysis (Complete)
- [x] **LZ4 (C)**: Verified `LZ4_compress_generic` uses `searchMatchNb = acceleration << LZ4_skipTrigger`.
- [x] **Constant**: `LZ4_skipTrigger` is implicitly `6`.
- [x] **Formula**:
    -   `searchMatchNb` starts at `acceleration << 6`.
    -   `step = (searchMatchNb++ >> 6)`.

## Task
- [ ] Implementation: Update `src/block/blockCompress.js`.
    -   Add `acceleration` arg (default 1).
    -   Update initialization of `searchMatchCount`.
    -   Remove hardcoded `+ 3` offset (unless justified, but for spec compliance we should match).
- [ ] API: Expose via `LZ4.compress(..., { acceleration })`.
- [ ] API: Expose via `LZ4.compressRaw`.

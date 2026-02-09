# Todo: Spec Compliance

## Critical Gaps
- [x] **Skippable Frames**:
    -   **Spec**: Frames starting with Magic Number `0x184D2A50` to `0x184D2A5F`.
    -   **Current**: `bufferDecompress` throws "Invalid Magic Number".
    -   **Fix**: Implement logic to read the 4-byte size following the magic number and skip that many bytes. (Implemented)
- [x] **Block Checksums**:
    -   **Spec**: Optional 4-byte xxHash32 after each block if flag set.
    -   **Current**:
        -   Encoder: No support.
        -   Decoder: Skips bytes but does not verify.
    -   **Fix**: Add verification logic to `bufferDecompress` and `streamDecompress`. (Implemented in Buffer APIs)

## Non-Critical Gaps
- [x] **Legacy Frames**:
    -   **Spec**: `0x184C2102`. Fixed 8MB blocks.
    -   **Current**: Not supported.
    -   **Decision**: Low priority. Documented as "Unsupported".


import { test } from 'node:test';
import assert from 'node:assert';
import { writeFrameHeader, getBlockId } from '../../src/frame/frameHeader.js';

test('frameHeader: getBlockId', (t) => {
    assert.strictEqual(getBlockId(65536), 4);
    assert.strictEqual(getBlockId(4194304), 7);
    assert.strictEqual(getBlockId(100), 4); // < 64KB maps to ID 4
});

test('frameHeader: writeFrameHeader', (t) => {
    const buf = new Uint8Array(20);
    const len = writeFrameHeader(buf, 0, 4194304, false, false, false, null, null);

    // Magic Number: 04 22 4D 18
    assert.strictEqual(buf[0], 0x04);
    assert.strictEqual(buf[1], 0x22);
    assert.strictEqual(buf[2], 0x4D);
    assert.strictEqual(buf[3], 0x18);

    // Flags: Version(01) + Indep(0) + BChecksum(0) + CSize(0) + CChecksum(0) + Dict(0)
    // Flg byte: 01 0 0 0 0 0 -> 0x40 (Version is bits 6-7). 

    // BD Byte: Reserved(0) + BlockMax(111 -> 7)
    // 0x70

    // Checksum

    assert.ok(len > 4);
});

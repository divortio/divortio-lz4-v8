
import { test } from 'node:test';
import assert from 'node:assert';
import { writeU32 } from '../../src/utils/byteUtils.js';

test('byteUtils: writeU32', (t) => {
    const buf = new Uint8Array(8);
    // Write 0x12345678 at index 2
    // LE: 78 56 34 12
    writeU32(buf, 0x12345678, 2);

    assert.strictEqual(buf[0], 0);
    assert.strictEqual(buf[1], 0);
    assert.strictEqual(buf[2], 0x78);
    assert.strictEqual(buf[3], 0x56);
    assert.strictEqual(buf[4], 0x34);
    assert.strictEqual(buf[5], 0x12);
    assert.strictEqual(buf[6], 0);
});
